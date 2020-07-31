# browserslist.dev

> A website to display compatible browsers from browserslist string.

## Predefined list

You can pass additional parameters in the URL to show a predefined list of browsers. If you pass the parameters as `?ref=pspdfkit&version=2020.4.0`, the website will show data from `data/pspdfkit/2020.4.0.json`. The JSON file stores data in the following format:

```typescript
interface JSON {
  // list of supported browsers
  supportedBrowsers: string[];
  // browserslist configuration
  config: string[];
  // Title of the page. You can enter a HTML string
  title: string;
  // version of browserslist
  browserslist: string;
  // version of caniuse-lite used to generate data
  caniuse?: string;
}
```

You can see a sample JSON file [here](data/pspdfkit/2020.4.0.json).

## Bundling

All the data present in the JSON files is present in the props of the main React Component. This is possible because of the SSG capabilities of Next.js.

## Development

- Clone the repo
- Run the development build: `yarn dev`

## License

MIT
