import should from "should";
import * as babel from "babel-core";
import fs from "fs";
import path from "path";
import makePlugin from "./plugin";
import sourceMapSupport from "source-map-support";
import * as utils from "isotropy-plugin-dev-utils";


sourceMapSupport.install();

describe("isotropy-ast-analyzer-db", () => {
  console.log(utils)
  debugger;
  function run([description, dir, opts]) {
    it(`${description}`, () => {
      const fixturePath = path.resolve(
        __dirname,
        "fixtures",
        dir,
        `fixture.js`
      );

      const pluginInfo = makePlugin(opts);

      const callWrapper = () => {
        babel.transformFileSync(fixturePath, {
          plugins: [
            [
              pluginInfo.plugin,
              {
                projects: [
                  {
                    dir: "dist/test",
                    modules: [
                      {
                        source: "dist/test/fixtures/my-db",
                        databases: {
                          todos: { connection: "redis://127.0.0.1:6379" }
                        }
                      }
                    ]
                  }
                ]
              }
            ],
            "transform-object-rest-spread"
          ],
          parserOpts: {
            sourceType: "module",
            allowImportExportEverywhere: true
          },
          babelrc: false
        });
        return pluginInfo.getResult();
      };

      return dir.includes("error")
        ? should(() => callWrapper()).throw(
            /Compilation failed. Not a valid isotropy operation./
          )
        : (() => {
            const expected = require(`./fixtures/${dir}/expected`);
            const result = callWrapper();
            const actual = utils.astCleaner.clean(result.analysis);
            actual.should.deepEqual(expected);
          })();
    });
  }

  const tests = [
    ["get", "get"],
    ["put", "put"],
    ["del", "del"],
  ];

  for (const test of tests) {
    run(test);
  }
});
