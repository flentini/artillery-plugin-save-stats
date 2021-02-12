# Artillery.io Save Stats Plugin

Save artillery stats to file as a newline delimited JSON

## Usage

### Installation

```
# If Artillery is installed globally, the plugin needs to be installed globally as well:

npm install [-g] artillery-plugin-save-stats
```

### Example configuration

```yaml
config:
  plugins:
    save-stats:
      destination: 'path/to/file'
```
