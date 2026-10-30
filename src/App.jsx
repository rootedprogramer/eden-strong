import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './screens/Landing';
import SignUp from './screens/auth/SignUp';
import SignIn from './screens/auth/SignIn';
import OnboardingFlow from './screens/onboarding/OnboardingFlow';
import DashboardLayout from './screens/dashboard/DashboardLayout';
import DashboardHome from './screens/dashboard/Home';
import Devotion from './screens/dashboard/Devotion';
import ProgramsIntro from './screens/dashboard/programs/ProgramsIntro';
import ProgramTracks from './screens/dashboard/programs/ProgramTracks';
import ProgramSplits from './screens/dashboard/programs/ProgramSplits';
import ProgramDetail from './screens/dashboard/programs/ProgramDetail';
import LogWorkout from './screens/dashboard/LogWorkout';
import Profile from './screens/dashboard/Profile';
import Nutrition from './screens/dashboard/Nutrition';
import RecipeBook from './screens/dashboard/RecipeBook';
import Recipe from './screens/dashboard/Recipe';
import TapCook from './screens/dashboard/TapCook';
import CookRecipe from './screens/dashboard/CookRecipe';
import MealPlan from './screens/dashboard/MealPlan';
import AdminHome from './screens/admin/AdminHome';
import AdminProgramEditor from './screens/admin/AdminProgramEditor';
import AdminRecipeEditor from './screens/admin/AdminRecipeEditor';
import AdminMealPlanEditor from './screens/admin/AdminMealPlanEditor';
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
          <Route path="programs/level/:level" element={<ProgramTracks />} />
          <Route path="programs/level/:level/:track" element={<ProgramSplits />} />
          <Route path="log" element={<LogWorkout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="nutrition/recipes" element={<RecipeBook />} />
          <Route path="nutrition/recipes/:id" element={<Recipe />} />
          <Route path="nutrition/tap-cook" element={<TapCook />} />
          <Route path="nutrition/cook/:id" element={<CookRecipe />} />
          <Route path="nutrition/plan" element={<MealPlan />} />
          <Route path="admin" element={<AdminHome />} />
          <Route path="admin/programs/:id" element={<AdminProgramEditor />} />
          <Route path="admin/recipes/:id" element={<AdminRecipeEditor />} />
          <Route path="admin/meal-plans/:id" element={<AdminMealPlanEditor />} />
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
