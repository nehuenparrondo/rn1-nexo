/**
 * Entrada estable del sistema visual, organizado en módulos de responsabilidad única.
 * Las pantallas conservan sus acciones y sus validaciones.
 *
 * Lectura guiada. Componente reutilizable ui. Sus props conectan contenido y acciones con
 * el componente que lo usa; para seguir el dato, buscar sus importaciones y los callbacks
 * recibidos en lugar de suponer que guarda directamente en una base.
 */
export { Action } from './ui/button';
export { Avatar } from './ui/avatar';
export { Copy } from './ui/typography';
export { Field } from './ui/field';
export { Feedback, Loading } from './ui/feedback';
export {
  Actions,
  AuthLayout,
  Card,
  Columns,
  Screen,
  Section,
} from './ui/layout';
