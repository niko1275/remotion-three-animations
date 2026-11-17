import {Box} from '../../scenes/Kit';
import {Bed} from '../props/Bed';
import {Nightstand} from '../props/Nightstand';
import {Lamp} from '../props/Lamp';
import {Clock} from '../props/Clock';
import {Chair} from '../props/Chair';
import {Window} from '../props/Window';
import {IVStand} from '../props/IVStand';
import {Sink} from '../props/Sink';
import {Decorations} from '../props/Decorations';
export function Bedroom({lampPower=1}:{lampPower?:number}){return <>
 <Box p={[0,-.16,0]} s={[7,.3,6]} c="#163a36" ink/>
 <Box p={[0,1.9,-3]} s={[7,4,.14]} c="#39665c" ink/>
 <Box p={[-3.5,1.9,0]} s={[.14,4,6]} c="#2d554d" ink/>
 <Box p={[0,.12,-2.88]} s={[7,.2,.12]} c="#233f36" ink/>
 <Box p={[-3.38,.12,0]} s={[.12,.2,6]} c="#233f36" ink/>
 <Bed/><Nightstand/><Lamp power={lampPower}/><Clock/><Window/><Chair/><IVStand/><Sink/><Decorations/>
 </>;}
