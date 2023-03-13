export type HelloAnchor = {
  "version": "0.1.0",
  "name": "hello_anchor",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "myAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update",
      "accounts": [
        {
          "name": "myAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "executed",
          "type": "bool"
        }
      ]
    },
    {
      "name": "getData",
      "accounts": [
        {
          "name": "myAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "GetDataParams"
          }
        }
      ],
      "returns": {
        "defined": "LimitOrder"
      }
    }
  ],
  "accounts": [
    {
      "name": "myAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "LimitOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fieldA",
            "type": "u64"
          },
          {
            "name": "fieldB",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "GetDataParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};

export const IDL: HelloAnchor = {
  "version": "0.1.0",
  "name": "hello_anchor",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "myAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update",
      "accounts": [
        {
          "name": "myAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "executed",
          "type": "bool"
        }
      ]
    },
    {
      "name": "getData",
      "accounts": [
        {
          "name": "myAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "GetDataParams"
          }
        }
      ],
      "returns": {
        "defined": "LimitOrder"
      }
    }
  ],
  "accounts": [
    {
      "name": "myAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "LimitOrder",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fieldA",
            "type": "u64"
          },
          {
            "name": "fieldB",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "GetDataParams",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
