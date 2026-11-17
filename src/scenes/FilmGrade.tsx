import {AbsoluteFill} from 'remotion';
// Screen-space grading is composited by Chromium at export resolution.
// Fixed gradients only: no animated grain, stochastic samples or history buffer.
export function FilmGrade(){return <>
 <AbsoluteFill style={{pointerEvents:'none',mixBlendMode:'soft-light',background:'linear-gradient(125deg, rgba(228,192,141,.13), transparent 48%, rgba(75,112,134,.23))'}}/>
 <AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at 52% 43%, transparent 28%, rgba(12,19,24,.16) 65%, rgba(7,13,19,.58) 100%)'}}/>
 <AbsoluteFill style={{pointerEvents:'none',background:'linear-gradient(0deg, rgba(11,17,22,.22), transparent 38%)'}}/>
 </>;}
