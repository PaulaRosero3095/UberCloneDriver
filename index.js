// index.js
// gesture-handler must be the FIRST import (required by the Drawer navigator)
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
