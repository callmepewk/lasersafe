/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AboutUs from './pages/AboutUs';
import AdminControl from './pages/AdminControl';
import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import NeoFormulas from './pages/NeoFormulas';
import Patients from './pages/Patients';
import Plans from './pages/Plans';
import Prescriptions from './pages/Prescriptions';
import Professionals from './pages/Professionals';
import Profile from './pages/Profile';
import Reference from './pages/Reference';
import Support from './pages/Support';
import TermsAndConditions from './pages/TermsAndConditions';
import Tutorial from './pages/Tutorial';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AdminControl": AdminControl,
    "Calculator": Calculator,
    "Dashboard": Dashboard,
    "History": History,
    "NeoFormulas": NeoFormulas,
    "Patients": Patients,
    "Plans": Plans,
    "Prescriptions": Prescriptions,
    "Professionals": Professionals,
    "Profile": Profile,
    "Reference": Reference,
    "Support": Support,
    "TermsAndConditions": TermsAndConditions,
    "Tutorial": Tutorial,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};