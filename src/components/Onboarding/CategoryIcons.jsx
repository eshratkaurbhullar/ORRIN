// Replaced custom inline SVGs with lucide-react icons for consistency and easier maintenance.
// Import these named exports in onboarding components.
import { Film, Tv, Clapperboard, FileText, Sparkles } from 'lucide-react';

export const MovieIcon = (props) => <Film {...props} />;
export const TVIcon = (props) => <Tv {...props} />;
export const AnimeIcon = (props) => <Clapperboard {...props} />;
export const DocIcon = (props) => <FileText {...props} />;
export const AnyIcon = (props) => <Sparkles {...props} />;

export default null;
