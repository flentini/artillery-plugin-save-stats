const test = require("tape");
const fs = require("fs");
const EventEmitter = require("events").EventEmitter;

const SaveStats = require("../index");

const cleanUp = (file) => {
  try {
    setTimeout(() => fs.unlinkSync(file));
  } catch {}
};

const getDestination = () =>
  `./test/output_${Math.floor(Math.random() * 10000)}`;

test("basic checks", (t) => {
  const destination = getDestination();
  const events = new EventEmitter();
  const script = {
    config: {
      plugins: {
        "save-stats": {
          destination,
        },
      },
    },
    scenarios: [],
  };

  t.assert(new SaveStats.Plugin(script, events), "can create an instance");

  delete script.config.plugins["save-stats"].destination;

  t.throws(
    () => new SaveStats.Plugin(script, events),
    "throws if plugins.save-stats.destination is missing"
  );

  cleanUp(destination);
  t.end();
});

test("artillery 'stats' event", (t) => {
  const destination = getDestination();
  const events = new EventEmitter();
  const script = {
    config: {
      plugins: {
        "save-stats": {
          destination,
        },
      },
    },
    scenarios: [],
  };
  const statsData = {
    timestamp: new Date().toISOString(),
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

  const p = new SaveStats.Plugin(script, events);

  events.emit("stats", {
    report: () => statsData,
  });

  events.emit("done");

  p.cleanup(() => {
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
});

test("plugin options", (t) => {
  const destination = getDestination();
  const events = new EventEmitter();
  const script = {
    config: {
      plugins: {
        "save-stats": {
          destination,
          append: true,
        },
      },
    },
    scenarios: [],
  };
  const statsData = () => ({
    timestamp: new Date().toISOString(),
  });

  fs.writeFileSync(destination, JSON.stringify(statsData()) + "\n");

  const p = new SaveStats.Plugin(script, events);

  events.emit("stats", {
    report: () => statsData(),
  });
  events.emit("done");

  p.cleanup(() => {
    fs.readFile(destination, (_, data) => {
      cleanUp(destination);

      const lines = data.toString().trim().split("\n");
      t.equal(lines.length, 2, "can append lines to an existing file");
      t.end();
    });
  });
});
