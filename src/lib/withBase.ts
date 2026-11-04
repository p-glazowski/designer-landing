/**
 * The address of a page or file of this site, given as if the site sat at the domain root.
 * The site isn't always there: on GitHub Pages it lives under /designer-landing/.
 */
export const withBase = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
