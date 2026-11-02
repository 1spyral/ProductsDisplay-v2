import { transform } from "@svgr/core";
import jsx from "@svgr/plugin-jsx";
import { plugin } from "bun";
import svgrOptions from "../../svgr.config.json";

// Render the real package SVGs in unit tests with the same options as Next.js.
plugin({
    name: "material-symbols-svg",
    setup(build) {
        build.onLoad(
            { filter: /@material-symbols\/svg-400\/rounded\/[^/]+\.svg$/ },
            async ({ path }) => ({
                contents: await transform(
                    await Bun.file(path).text(),
                    { ...svgrOptions, plugins: [jsx] },
                    { componentName: "MaterialSymbol", filePath: path }
                ),
                loader: "jsx",
            })
        );
    },
});
