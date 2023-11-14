import {
  InvoiceDataFromJson,
  InvoiceDataToJson,
} from "../objects/InvoiceData.js";

describe("Serialization", () => {
  test("should serialize and deserialize InvoiceData to the same object", () => {
    const serialized = `{"__typename": "InvoiceData", "invoice_data_encoded_payment_request":"lnbcrt34170n1pj5vdn4pp56jhw0672v566u4rvl333v8hwwuvavvu9gx4a2mqag4pkrvm0hwkqhp5xaz278y6cejcvpqnndl4wfq3slgthjduwlfksg778aevn23v2pdscqzpgxqyz5vqsp5ee5jezfvjqvvz7hfwta3ekk8hs6dq36szkgp40qh7twa8upquxlq9qyyssqjg2slc95falxf2t67y0wu2w43qwfcvfflwl8tn4ppqw9tumwqxk36qkfct9p2w8c3yy2ld7c6nacy4ssv2gl6qyqfpmhl4jmarnjf8cpvjlxek","invoice_data_bitcoin_network":"REGTEST","invoice_data_payment_hash":"d4aee7ebca6535ae546cfc63161eee7719d6338541abd56c1d454361b36fbbac","invoice_data_amount":{"currency_amount_original_value":3417,"currency_amount_original_unit":"SATOSHI","currency_amount_preferred_currency_unit":"USD","currency_amount_preferred_currency_value_rounded":118,"currency_amount_preferred_currency_value_approx":118.89352818371607},"invoice_data_created_at":"2023-11-04T12:17:57Z","invoice_data_expires_at":"2023-11-05T12:17:57Z","invoice_data_memo":null,"invoice_data_destination":{"graph_node_id":"GraphNode:0189a572-6dba-cf00-0000-ac0908d34ea6","graph_node_created_at":"2023-07-30T06:18:07.162759Z","graph_node_updated_at":"2023-11-04T12:01:04.015414Z","graph_node_alias":"ls_test_vSViIQitob_SE","graph_node_bitcoin_network":"REGTEST","graph_node_color":"#3399ff","graph_node_conductivity":null,"graph_node_display_name":"ls_test_vSViIQitob_SE","graph_node_public_key":"02253935a5703a6f0429081e08d2defce0faa15f4d75305302284751d53a4e0608", "__typename":"GraphNode"}}`;
    const deserialized = InvoiceDataFromJson(JSON.parse(serialized));
    const reserialized = InvoiceDataToJson(deserialized) as Record<
      string,
      unknown
    >;
    expect(reserialized).toEqual(JSON.parse(serialized));

    const deserializedAgain = InvoiceDataFromJson(reserialized);
    expect(JSON.stringify(deserializedAgain)).toEqual(
      JSON.stringify(deserialized),
    );
  });
});
