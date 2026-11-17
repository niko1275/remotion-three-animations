import {BedroomStory} from '../scenes/BedroomStory';
import type {LightingMode} from '../components/lighting/CinematicLighting';
export function StoryShort({lighting='night'}:{lighting?:LightingMode}){return <BedroomStory lighting={lighting}/>;}
