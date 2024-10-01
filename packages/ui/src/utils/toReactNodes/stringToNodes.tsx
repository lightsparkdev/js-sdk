export function stringToNodes(str: string) {
  return str.split("\n").map((str, i, strArr) => {
    /* text property is a sufficient key for both strings and text nodes due to minimal impl */
    const key = `str-${i}-${str.substr(0, 20)}`;
    /* Must use spans to avoid conditional Fragment rendering errors https://bit.ly/3zkHEEM */
    return !str && i === strArr.length - 1 ? null : (
      <span key={key}>
        {str.length ? str : null}
        {i < strArr.length - 1 ? <br /> : null}
      </span>
    );
  });
}
