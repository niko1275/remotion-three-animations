import {shots as accusation} from '../scenes/la-acusacion/timeline';
import {shots as experiment} from '../scenes/el-experimento/timeline';
import {shots as trap} from '../scenes/la-trampa/timeline';
import {shots as witness} from '../scenes/el-falso-testigo/timeline';
import {shots as memory} from '../scenes/el-falso-recuerdo/timeline';
import {shots as results} from '../scenes/los-resultados/timeline';
import {shots as closing} from '../scenes/el-cierre/timeline';
import type {Intervention} from './script';

type Beat = {text: string; frame: number; event: string; atSeconds?: number};
type Shot = {id: string; frames: number};

function block(id: string, scene: string, shots: Shot[], beats: Beat[]) {
  const cue: Intervention = {
    id, scene, role: 'narrador', start: 0,
    frames: shots.reduce((sum, shot) => sum + shot.frames, 0),
    shots: shots.map(shot => shot.id),
    gestures: [],
    text: beats.map(beat => beat.text).join(' '),
  };
  return {cue, beats};
}

export const narrationBlocks = [
  block('n1', 'LaAcusacion', accusation, [
    {frame: 0, event: 'Abrir en la sala de interrogatorio', text: 'Fuiste tú. Presionaste la tecla.'},
    {frame: 135, event: 'Cortar a la reacción del estudiante', text: 'El estudiante estaba seguro de que no había sido él.'},
    {frame: 231, event: 'Mostrar al estudiante desde el hombro del investigador', text: '¿Cómo pudo acabar dudando de su propia memoria?'},
  ]),
  block('n2', 'ElExperimento', experiment, [
    {frame: 0, event: 'Revelar el laboratorio y el año', text: 'En 1996, Saul Kassin y Katherine Kiechel hicieron un experimento.'},
    {frame: 120, event: 'Mostrar la escritura al teclado', text: 'Los estudiantes tecleaban las letras que otra persona les dictaba.'},
    {frame: 270, event: 'Cortar al detalle de ALT', text: 'Solo había una regla: no presionar la tecla ALT.'},
  ]),
  block('n3', 'LaTrampa', trap, [
    {frame: 0, event: 'Continuar el dictado', text: 'La tarea parecía sencilla.'},
    {frame: 59, event: 'Mostrar el error del sistema', text: 'De pronto, la computadora falló.'},
    {frame: 120, event: 'Mostrar al investigador señalando la computadora', text: 'El investigador le dijo al estudiante que había presionado ALT.'},
    {frame: 270, event: 'Cortar a la negación del estudiante', text: 'El estudiante lo negó.'},
    {frame: 390, event: 'Mostrar ALT intacta', text: 'El fallo estaba programado. La acusación era falsa.'},
  ]),
  block('n4', 'ElFalsoTestigo', witness, [
    {frame: 0, event: 'El investigador dirige la mirada a la testigo', text: 'Entonces, el investigador buscó la confirmación de una testigo.'},
    {frame: 90, event: 'Cortar a la testigo', text: 'Ella aseguró haber visto al estudiante presionar ALT.'},
    {frame: 180, event: 'Mostrar la sorpresa del estudiante', text: 'Al oírla, el estudiante se quedó desconcertado.'},
    {frame: 300, event: 'Acompañar la mirada hacia el teclado', text: 'Y por primera vez, empezó a dudar.'},
  ]),
  block('n5', 'ElFalsoRecuerdo', memory, [
    {frame: 0, event: 'Mostrar al estudiante absorto', text: 'Empezó a preguntarse si se le había escapado algo.'},
    {frame: 90, event: 'Entrar en la reconstrucción mental del teclado', text: '¿Y si la presioné sin darme cuenta?'},
    {frame: 360, event: 'Volver al presente', text: 'Podía imaginar el gesto. Pero imaginarlo no era recordarlo.'},
  ]),
  block('n6', 'LosResultados', results, [
    {frame: 0, event: 'Mostrar la declaración', text: 'Los resultados fueron sorprendentes.'},
    {frame: 42, event: 'Iniciar el trazo de la firma', text: 'El 69 % firmó una confesión falsa.'},
    {frame: 150, event: 'Mostrar al estudiante aislado', text: 'El 28 % llegó a asumir una culpa que no tenía.'},
    {frame: 300, event: 'Volver a los fragmentos mentales', text: 'Y el 9 % incluso inventó detalles para explicar lo ocurrido.'},
    {frame: 420, event: 'Volver a ALT intacta', text: 'Ninguno había presionado ALT.'},
  ]),
  block('n7', 'ElCierre', closing, [
    {frame: 0, event: 'Volver a la sala de la apertura', text: 'Bastó una acusación para que algunos desconfiaran de su propia memoria.'},
    {frame: 180, event: 'Pasar a la perspectiva del estudiante', text: 'Por un momento, imagina que estás en su lugar.'},
    {frame: 390, event: 'Recuperar el encuadre y la postura de la apertura', text: 'Y todo puede comenzar cuando alguien te dice...'},
  ]),
];

export const narrationSourceFrames = narrationBlocks.reduce((sum, {cue}) => sum + cue.frames, 0);
