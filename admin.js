import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// true / false once known, null while checking
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(null);
  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return setIsAdmin(false);
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', uid).maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);
  return isAdmin;
}

export const EDITION_OPTIONS = [
  ['', 'Every edition'],
  ['women', 'Eden Strong only (women)'],
  ['men', 'Faith Over Flesh only (men)'],
  ['together', 'One Accord only (couples)'],
];
export const RECIPE_CATEGORY_OPTIONS = ['Smoothies', 'Snacks', 'Breakfasts', 'Lunches', 'Dinners', 'Desserts'];
export const MEALS = ['Breakfast', 'Snack', 'Lunch', 'Dinner', 'Dessert'];
export const SECTION_OPTIONS = [
  ['mobility', 'Mobility'],
  ['workout', 'Workout'],
  ['abs', 'Ab circuit'],
  ['core', 'Deep core finisher'],
  ['cardio', 'Cardio'],
  ['stretch', 'Stretch'],
];
