const test = require("tape");
const fs = require("fs");
const EventEmitter = require("events").EventEmitter;

const SaveStats = require("../index");

const cleanUp = (file) => fs.unlinkSync(file);

test("basic checks", (t) => {
  const destination = "./output";
  const events = new EventEmitter();
  const script = {
    plugins: {
      "save-stats": {
        destination,
      },
    },
    scenarios: [],
  };

  t.assert(new SaveStats(script, events), "can create an instance");

  delete script.plugins["save-stats"].destination;

  t.throws(
    () => new SaveStats(script, events),
    "throws if plugins.save-stats.destination is missing"
  );

  cleanUp(destination);
  t.end();
});

test("artillery 'stats' event", (t) => {
  const destination = "./test/output";
  const events = new EventEmitter();
  const script = {
    plugins: {
      "save-stats": {
        destination,
      },
    },
    scenarios: [],
  };
  const statsData = {
    timestamp: "2021-02-12T17:17:35.906Z",
    summaries: {
      "engine.http.response_time": {
        min: 2,
        max: 2.2,
        median: 2,
        p75: 2,
        p95: 2,
        p99: 2,
      },
    },
  };

  new SaveStats(script, events);

  events.emit("stats", {
    report: () => statsData,
  });

  fs.readFile(destination, (_, data) => {
    cleanUp(destination);

    t.equal(
      data.toString(),
      `${JSON.stringify(statsData)}\n`,
      "writes data to file"
    );
    t.end();
  });
});

test("plugin options", (t) => {
  const destination = "./test/output";
  const events = new EventEmitter();
  const script = {
    plugins: {
      "save-stats": {
        destination,
        append: true,
      },
    },
    scenarios: [],
  };
  const statsData = {
    timestamp: "2021-02-12T17:17:35.906Z",
  };

  fs.writeFileSync(destination, JSON.stringify(destination) + "\n");

  new SaveStats(script, events);

  events.emit("stats", {
    report: () => statsData,
  });

  fs.readFile(destination, (_, data) => {
    cleanUp(destination);

    const lines = data.toString().trim().split("\n");
    t.equal(lines.length, 2, "can append lines to an existing file");
    t.end();
  });
});
