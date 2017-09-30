import { source } from "../chimpanzee-utils";
import { collection } from "./";
import { capture, Match, Skip } from "chimpanzee";
import composite from "../chimpanzee-utils/composite";
import R from "ramda";
import { del } from "../db-statements";

export default function(state, analysisState) {
  return composite(
    {
      type: "AssignmentExpression",
      operator: "=",
      left: source([collection])(state, analysisState),
      right: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: source([collection])(state, analysisState),
          property: {
            type: "Identifier",
            name: "filter"
          }
        },
        arguments: [
          {
            type: "ArrowFunctionExpression",
            params: [
              {
                type: "Identifier",
                name: capture("dbRecordIdentifier1")
              }
            ],
            body: {
              type: "UnaryExpression",
              operator: "!",
              argument: {
                type: "BinaryExpression",
                left: {
                  type: "MemberExpression",
                  object: {
                    type: "CallExpression",
                    callee: {
                      type: "MemberExpression",
                      object: {
                        type: "Identifier",
                        name: "Object"
                      },
                      property: {
                        type: "Identifier",
                        name: "keys"
                      }
                    },
                    arguments: [
                      {
                        type: "Identifier",
                        name: capture("dbRecordIdentifier2")
                      }
                    ]
                  },
                  property: {
                    type: "NumericLiteral",
                    value: 0
                  }
                },
                operator: "===",
                right: capture("key")
              }
            }
          }
        ]
      }
    },
    {
      build: obj => context => result =>
        result instanceof Match
          ? (() => {
              return R.equals(result.value.left, result.value.object)
                ? R.equals(
                    result.value.arguments[0].params[0].dbRecordIdentifier1,
                    result.value.arguments[0].arguments[0].dbRecordIdentifier2
                  )
                  ? del(result.value.left, {
                      keyNode: result.value.arguments[0].key
                    })
                  : new Skip(`Incorrect access variable.`)
                : new Skip(
                    `The result of the concat() must be assigned to the same collection.`
                  );
            })()
          : result
    }
  );
}
