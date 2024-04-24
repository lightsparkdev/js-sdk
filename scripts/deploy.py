#!/usr/bin/env python3

import argparse
import logging
from os.path import basename, join

import boto3

parser = argparse.ArgumentParser(description="Deploy frontend to production")
parser.add_argument("--source", default="lsdev-frontend", help="Source S3 bucket")
parser.add_argument("--frontend", default="lightspark-app", help="Frontend project")
parser.add_argument(
    "--destination", default="lightspark-prod-web", help="Destination S3 bucket"
)
parser.add_argument(
    "--check",
    action="store_true",
    default=False,
    help="Just check that the specified version exists",
)
parser.add_argument(
    "--min-files",
    type=int,
    default=10,
    help="Minimum number of files which should be present",
)
parser.add_argument(
    "--max-age-static",
    type=int,
    default=30 * 24 * 60 * 60,
    help="Cache-Control max-age to set for files in static/",
)
parser.add_argument(
    "--s-maxage-root",
    type=int,
    default=15,
    help="Cache-Control s-maxage to set for files in static/",
)
parser.add_argument(
    "--strip-extension",
    action="store_true",
    help="Strip .html extension from filenames",
)
parser.add_argument("version", help="Frontend Git hash to deploy")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger()

s3 = boto3.resource("s3")


def sync(args):
    src_bucket = s3.Bucket(args.source)
    dst_bucket = s3.Bucket(args.destination)
    src_path = f"{args.frontend}/{args.version[:19]}/"

    src_files = sorted(
        src_bucket.objects.filter(Prefix=src_path),
        key=lambda f: (
            f.key.count("/"),
            basename(f.key) not in {"index.html", "asset-manifest.json"},
        ),
        reverse=True,
    )
    log.info("Listed %d files from %s/%s", len(src_files), args.source, src_path)
    if len(src_files) < args.min_files:
        raise Exception(
            f"Only found {len(src_files)} files, expected at least {args.min_files}"
        )

    if args.check:
        return

    dst_files = {f.key: f for f in dst_bucket.objects.filter()}
    log.info("Listed %d files from %s", len(dst_files), args.destination)

    for f in src_files:
        path = f.key.removeprefix(src_path)
        if args.strip_extension:
            path = path.removesuffix(".html")

        if path not in dst_files:
            log.info("%s not present", path)
        elif f.size != dst_files[path].size:
            log.info("%s size differs", path)
        elif f.meta.data["ETag"] != dst_files[path].meta.data["ETag"]:
            log.info("%s ETag differs", path)
        else:
            log.info("%s matches", path)
            continue

        src_file = src_bucket.Object(f.key)
        dst_bucket.Object(path).copy_from(
            CopySource=join(f.bucket_name, f.key),
            ContentType=src_file.content_type,
            CacheControl=f"max-age={args.max_age_static}, immutable"
            if path.startswith("static/") or path.startswith("_next/")
            else f"max-age=0, s-maxage={args.s_maxage_root}",
            MetadataDirective="REPLACE",
        )


if __name__ == "__main__":
    args = parser.parse_args()
    sync(args)
