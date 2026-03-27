---
"@lightsparkdev/core": patch
---

- Add support for BDT, COP, EGP, GHS, HTG, JMD, PKR currencies
- Remove VND from cent-based currencies
- Use bigint for cryptographic nonces to avoid precision loss with large values
