const { createWriteStream } = require("fs");
const { finished } = require("stream");
const debug = require("debug")("plugin:save-stats");

class SaveStats {
  constructor(script, ee) {
    this.script = script;
    this.ee = ee;

    this.readConfig(script.config.plugins["save-stats"]);

    this.ws = createWriteStream(this.destination, this.wsOptions);

    this.ee.on("stats", (stats) => this.writeStats(stats));
    this.ee.on("done", () => this.ws.end());
  }

  writeStats(stats) {
    this.ws.write(`${JSON.stringify(stats.report())}\n`);
  }

  readConfig(config) {
    if (!config || !config.destination) {
      throw new Error(`plugins.save-stats.destination is required`);
    }

    if (config.append) {
      this.wsOptions = {
        flags: "a",
      };
    }

    this.destination = config.destination;

    debug(`destination: ${this.destination}, wsOptions: ${this.wsOptions}`);
  }

  cleanup(done) {
    debug("cleanup");
    finished(this.ws, done);
  }
}

module.exports = {
  Plugin: SaveStats,
};
