import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './screens/Landing';
import SignUp from './screens/auth/SignUp';
import SignIn from './screens/auth/SignIn';
import OnboardingFlow from './screens/onboarding/OnboardingFlow';
import DashboardLayout from './screens/dashboard/DashboardLayout';
import DashboardHome from './screens/dashboard/Home';
import Devotion from './screens/dashboard/Devotion';
import ProgramsIntro from './screens/dashboard/programs/ProgramsIntro';
import ProgramLevels from './screens/dashboard/programs/ProgramLevels';
import ProgramSplits from './screens/dashboard/programs/ProgramSplits';
import ProgramDetail from './screens/dashboard/programs/ProgramDetail';
import LogWorkout from './screens/dashboard/LogWorkout';
import Profile from './screens/dashboard/Profile';
import Nutrition from './screens/dashboard/Nutrition';
import RecipeBook from './screens/dashboard/RecipeBook';
import DailyBread from './screens/dashboard/DailyBread';
import CookRecipe from './screens/dashboard/CookRecipe';
import Community from './screens/dashboard/Community';
import Progress from './screens/dashboard/Progress';
import ProgressChart from './screens/dashboard/ProgressChart';
import Habits from './screens/dashboard/Habits';
import Coaches from './screens/dashboard/Coaches';
import Workout from './screens/dashboard/Workout';
import Exercise from './screens/dashboard/Exercise';
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
          <Route path="program" element={<ProgramsIntro />} />
          <Route path="programs/view/:id" element={<ProgramDetail />} />
          <Route path="programs/:location" element={<ProgramLevels />} />
          <Route path="programs/:location/:level" element={<ProgramSplits />} />
          <Route path="log" element={<LogWorkout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="nutrition/recipes" element={<RecipeBook />} />
          <Route path="nutrition/daily-bread" element={<DailyBread />} />
          <Route path="nutrition/cook/:id" element={<CookRecipe />} />
          <Route path="community" element={<Community />} />
          <Route path="progress" element={<Progress />} />
          <Route path="progress/chart/:id" element={<ProgressChart />} />
          <Route path="habits" element={<Habits />} />
          <Route path="coaches" element={<Coaches />} />
          <Route path="workout" element={<Workout />} />
          <Route path="workout/:exerciseId" element={<Exercise />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
