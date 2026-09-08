import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './screens/Landing';
import SignUp from './screens/auth/SignUp';
import SignIn from './screens/auth/SignIn';
import OnboardingFlow from './screens/onboarding/OnboardingFlow';
import DashboardLayout from './screens/dashboard/DashboardLayout';
import DashboardHome from './screens/dashboard/Home';
import Devotion from './screens/dashboard/Devotion';
import Program from './screens/dashboard/Program';
import LogWorkout from './screens/dashboard/LogWorkout';
import Profile from './screens/dashboard/Profile';
import Nutrition from './screens/dashboard/Nutrition';
import RecipeBook from './screens/dashboard/RecipeBook';
import Community from './screens/dashboard/Community';
import Progress from './screens/dashboard/Progress';
import Habits from './screens/dashboard/Habits';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingFlow />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="devotion" element={<Devotion />} />
          <Route path="program" element={<Program />} />
          <Route path="log" element={<LogWorkout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="nutrition/recipes" element={<RecipeBook />} />
          <Route path="community" element={<Community />} />
          <Route path="progress" element={<Progress />} />
          <Route path="habits" element={<Habits />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
