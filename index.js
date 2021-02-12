const { createWriteStream } = require("fs");

class SaveStats {
  constructor(script, ee) {
    this.script = script;
    this.ee = ee;

    this.parseConf(script);

    this.ws = createWriteStream(this.destination);

    this.ee.on("stats", (stats) => this.writeStats(stats));
  }

  writeStats(stats) {
    this.ws.write(`${JSON.stringify(stats.report())}\n`);
  }

  parseConf(script) {
    const conf = script.plugins["save-stats"];

    if (!conf.destination) {
      throw new Error(`plugins.save-stats.destination is required`);
    }

    this.destination = conf.destination;
  }
}

module.exports = SaveStats;
