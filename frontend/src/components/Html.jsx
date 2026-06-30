// Renders a backend-provided HTML string (illustrative data uses <b>, <a>, <i>).
export default function Html({ html, as = 'span', className, style }) {
  const Tag = as
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html || '' }} />
}
