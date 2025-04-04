import packageJson from '../package.json'

export const routes = {
    about: packageJson.basename,
    ui: `${packageJson.basename}/ui`,
    config: `${packageJson.basename}/config`,
    orders: `${packageJson.basename}/orders`,
}
