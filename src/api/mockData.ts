// ─── Mock data for testing without Claude API credits ──────────────────────────

export const mockFitnessPlan = {
  planName: "FitForge Power Build — 8 Week Plan",
  weeklySchedule: [
    {
      day: "Monday",
      type: "workout",
      focus: "Chest & Triceps",
      workouts: [
        { name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: 90, notes: "Keep elbows at 45°", youtubeSearchQuery: "barbell bench press form tutorial" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: 75, notes: "Full range of motion", youtubeSearchQuery: "incline dumbbell press tutorial" },
        { name: "Cable Chest Fly", sets: 3, reps: "12-15", rest: 60, notes: "Squeeze at the top", youtubeSearchQuery: "cable chest fly tutorial" },
        { name: "Tricep Rope Pushdown", sets: 3, reps: "12-15", rest: 60, notes: "Keep elbows pinned", youtubeSearchQuery: "tricep rope pushdown tutorial" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: 60, notes: "Full stretch at bottom", youtubeSearchQuery: "overhead tricep extension tutorial" },
      ],
    },
    {
      day: "Tuesday",
      type: "workout",
      focus: "Back & Biceps",
      workouts: [
        { name: "Deadlift", sets: 4, reps: "5-6", rest: 120, notes: "Neutral spine throughout", youtubeSearchQuery: "deadlift form tutorial beginner" },
        { name: "Pull-ups", sets: 4, reps: "6-10", rest: 90, notes: "Full hang at bottom", youtubeSearchQuery: "pull up form tutorial" },
        { name: "Seated Cable Row", sets: 3, reps: "10-12", rest: 75, notes: "Retract shoulder blades", youtubeSearchQuery: "seated cable row tutorial" },
        { name: "Barbell Curl", sets: 3, reps: "10-12", rest: 60, notes: "No swinging", youtubeSearchQuery: "barbell curl form tutorial" },
        { name: "Hammer Curl", sets: 3, reps: "12-15", rest: 60, notes: "Neutral grip throughout", youtubeSearchQuery: "hammer curl tutorial" },
      ],
    },
    {
      day: "Wednesday",
      type: "rest",
      focus: "Rest & Recovery",
      workouts: [],
    },
    {
      day: "Thursday",
      type: "workout",
      focus: "Legs & Glutes",
      workouts: [
        { name: "Barbell Back Squat", sets: 4, reps: "8-10", rest: 120, notes: "Break parallel depth", youtubeSearchQuery: "barbell squat form tutorial" },
        { name: "Romanian Deadlift", sets: 3, reps: "10-12", rest: 90, notes: "Hinge at hips, soft knees", youtubeSearchQuery: "romanian deadlift tutorial" },
        { name: "Leg Press", sets: 3, reps: "12-15", rest: 75, notes: "Feet shoulder width apart", youtubeSearchQuery: "leg press tutorial form" },
        { name: "Leg Curl", sets: 3, reps: "12-15", rest: 60, notes: "Full contraction at top", youtubeSearchQuery: "leg curl machine tutorial" },
        { name: "Calf Raises", sets: 4, reps: "15-20", rest: 45, notes: "Pause at top and bottom", youtubeSearchQuery: "calf raises tutorial" },
      ],
    },
    {
      day: "Friday",
      type: "workout",
      focus: "Shoulders & Core",
      workouts: [
        { name: "Overhead Press", sets: 4, reps: "8-10", rest: 90, notes: "Bar path in front of face", youtubeSearchQuery: "overhead press form tutorial" },
        { name: "Lateral Raises", sets: 4, reps: "12-15", rest: 60, notes: "Lead with elbows", youtubeSearchQuery: "lateral raises tutorial" },
        { name: "Face Pulls", sets: 3, reps: "15-20", rest: 60, notes: "External rotation at end", youtubeSearchQuery: "face pulls cable tutorial" },
        { name: "Plank", sets: 3, reps: "45-60s", rest: 60, notes: "Straight line from head to heel", youtubeSearchQuery: "plank form tutorial" },
        { name: "Cable Crunch", sets: 3, reps: "15-20", rest: 45, notes: "Round the spine at bottom", youtubeSearchQuery: "cable crunch tutorial" },
      ],
    },
    {
      day: "Saturday",
      type: "active_recovery",
      focus: "Active Recovery",
      workouts: [
        { name: "Light Cardio (Walk or Cycle)", sets: 1, reps: "30 min", rest: 0, notes: "Keep heart rate under 130 bpm", youtubeSearchQuery: "active recovery workout" },
        { name: "Foam Rolling", sets: 1, reps: "10 min", rest: 0, notes: "Focus on sore areas", youtubeSearchQuery: "foam rolling full body tutorial" },
      ],
    },
    {
      day: "Sunday",
      type: "rest",
      focus: "Full Rest",
      workouts: [],
    },
  ],
  progressionNotes: "Increase weight by 2.5–5kg when you complete all sets at the top of the rep range for 2 consecutive sessions. Deload every 4th week by reducing weight to 60% of your working sets.",
  weeklyGoals: [
    "Complete all 4 workout sessions",
    "Hit daily protein target (1.8–2.2g per kg bodyweight)",
    "Sleep 7–9 hours per night for optimal recovery",
    "Log every workout with weights used",
  ],
}

export const mockDietPlan = {
  dailyCalories: 2400,
  macros: { protein: 180, carbs: 240, fats: 80 },
  days: [
    {
      day: "Monday",
      meals: [
        {
          type: "Breakfast",
          name: "Greek Yogurt Power Bowl",
          calories: 520,
          protein: 42,
          carbs: 55,
          fats: 12,
          ingredients: ["200g Greek yogurt", "1 banana", "40g granola", "1 tbsp honey", "15g almonds"],
          prepTime: 5,
        },
        {
          type: "Lunch",
          name: "Chicken Rice Bowl",
          calories: 680,
          protein: 52,
          carbs: 72,
          fats: 16,
          ingredients: ["180g chicken breast", "150g cooked rice", "1 cup broccoli", "1 tbsp olive oil", "Soy sauce"],
          prepTime: 20,
        },
        {
          type: "Snack",
          name: "Protein Shake + Apple",
          calories: 280,
          protein: 28,
          carbs: 30,
          fats: 4,
          ingredients: ["1 scoop whey protein", "300ml milk", "1 medium apple"],
          prepTime: 2,
        },
        {
          type: "Dinner",
          name: "Salmon with Sweet Potato",
          calories: 620,
          protein: 45,
          carbs: 58,
          fats: 22,
          ingredients: ["200g salmon fillet", "200g sweet potato", "1 cup spinach", "1 tbsp olive oil", "Lemon"],
          prepTime: 25,
        },
      ],
    },
    {
      day: "Tuesday",
      meals: [
        {
          type: "Breakfast",
          name: "Oat & Egg White Pancakes",
          calories: 490,
          protein: 38,
          carbs: 58,
          fats: 10,
          ingredients: ["80g oats", "4 egg whites", "1 egg", "1 banana", "Cinnamon"],
          prepTime: 10,
        },
        {
          type: "Lunch",
          name: "Tuna Wrap",
          calories: 560,
          protein: 46,
          carbs: 52,
          fats: 14,
          ingredients: ["185g canned tuna", "2 whole wheat wraps", "Lettuce", "Tomato", "Greek yogurt"],
          prepTime: 10,
        },
        {
          type: "Snack",
          name: "Cottage Cheese & Berries",
          calories: 240,
          protein: 24,
          carbs: 22,
          fats: 5,
          ingredients: ["200g cottage cheese", "100g mixed berries", "1 tsp honey"],
          prepTime: 2,
        },
        {
          type: "Dinner",
          name: "Beef Stir Fry with Noodles",
          calories: 700,
          protein: 48,
          carbs: 72,
          fats: 20,
          ingredients: ["180g lean beef", "100g noodles", "Mixed vegetables", "Soy sauce", "Sesame oil"],
          prepTime: 20,
        },
      ],
    },
    {
      day: "Wednesday",
      meals: [
        {
          type: "Breakfast",
          name: "Scrambled Eggs on Toast",
          calories: 480,
          protein: 36,
          carbs: 42,
          fats: 18,
          ingredients: ["4 eggs", "2 slices whole grain bread", "1 tbsp butter", "Spinach", "Salt & pepper"],
          prepTime: 8,
        },
        {
          type: "Lunch",
          name: "Quinoa Salad with Chicken",
          calories: 620,
          protein: 50,
          carbs: 60,
          fats: 14,
          ingredients: ["150g chicken breast", "100g quinoa", "Cucumber", "Tomato", "Feta cheese", "Olive oil"],
          prepTime: 15,
        },
        {
          type: "Snack",
          name: "Protein Bar + Banana",
          calories: 310,
          protein: 22,
          carbs: 38,
          fats: 8,
          ingredients: ["1 protein bar", "1 banana"],
          prepTime: 0,
        },
        {
          type: "Dinner",
          name: "Turkey Meatballs with Pasta",
          calories: 680,
          protein: 52,
          carbs: 68,
          fats: 16,
          ingredients: ["200g turkey mince", "100g pasta", "Tomato sauce", "Parmesan", "Garlic", "Herbs"],
          prepTime: 30,
        },
      ],
    },
    {
      day: "Thursday",
      meals: [
        { type: "Breakfast", name: "Protein Smoothie Bowl", calories: 500, protein: 40, carbs: 55, fats: 10, ingredients: ["2 scoops protein powder", "1 banana", "50g oats", "Almond milk", "Berries"], prepTime: 5 },
        { type: "Lunch", name: "Grilled Chicken Salad", calories: 580, protein: 52, carbs: 40, fats: 18, ingredients: ["180g chicken breast", "Mixed greens", "Avocado", "Cherry tomatoes", "Balsamic dressing"], prepTime: 15 },
        { type: "Snack", name: "Rice Cakes with Peanut Butter", calories: 260, protein: 10, carbs: 32, fats: 12, ingredients: ["3 rice cakes", "2 tbsp peanut butter"], prepTime: 2 },
        { type: "Dinner", name: "Baked Cod with Vegetables", calories: 580, protein: 50, carbs: 48, fats: 16, ingredients: ["200g cod fillet", "200g mixed roasted vegetables", "Brown rice", "Lemon", "Herbs"], prepTime: 25 },
      ],
    },
    {
      day: "Friday",
      meals: [
        { type: "Breakfast", name: "French Toast with Berries", calories: 510, protein: 32, carbs: 62, fats: 14, ingredients: ["3 slices whole grain bread", "2 eggs", "Milk", "Mixed berries", "Maple syrup"], prepTime: 12 },
        { type: "Lunch", name: "Beef & Bean Burrito Bowl", calories: 700, protein: 50, carbs: 75, fats: 18, ingredients: ["160g lean beef", "Black beans", "Brown rice", "Salsa", "Greek yogurt", "Cheese"], prepTime: 20 },
        { type: "Snack", name: "Hard Boiled Eggs", calories: 200, protein: 18, carbs: 2, fats: 14, ingredients: ["3 hard boiled eggs", "Salt & pepper"], prepTime: 12 },
        { type: "Dinner", name: "Pork Tenderloin with Potatoes", calories: 640, protein: 52, carbs: 58, fats: 18, ingredients: ["200g pork tenderloin", "200g baby potatoes", "Green beans", "Mustard sauce"], prepTime: 30 },
      ],
    },
    {
      day: "Saturday",
      meals: [
        { type: "Breakfast", name: "Full Breakfast Stack", calories: 620, protein: 44, carbs: 52, fats: 24, ingredients: ["3 eggs", "2 turkey sausages", "Whole grain toast", "Avocado", "Cherry tomatoes"], prepTime: 15 },
        { type: "Lunch", name: "Chicken Caesar Wrap", calories: 580, protein: 46, carbs: 50, fats: 18, ingredients: ["180g chicken breast", "Whole wheat wrap", "Romaine lettuce", "Caesar dressing", "Parmesan"], prepTime: 10 },
        { type: "Snack", name: "Mixed Nuts & Greek Yogurt", calories: 320, protein: 20, carbs: 20, fats: 18, ingredients: ["30g mixed nuts", "150g Greek yogurt", "1 tsp honey"], prepTime: 2 },
        { type: "Dinner", name: "Lamb Chops with Couscous", calories: 720, protein: 52, carbs: 62, fats: 24, ingredients: ["200g lamb chops", "100g couscous", "Roasted vegetables", "Mint sauce"], prepTime: 25 },
      ],
    },
    {
      day: "Sunday",
      meals: [
        { type: "Breakfast", name: "Overnight Oats", calories: 480, protein: 28, carbs: 68, fats: 10, ingredients: ["80g oats", "250ml milk", "1 scoop protein powder", "Banana", "Blueberries"], prepTime: 5 },
        { type: "Lunch", name: "Shrimp Stir Fry with Rice", calories: 560, protein: 46, carbs: 60, fats: 10, ingredients: ["200g shrimp", "150g jasmine rice", "Mixed vegetables", "Garlic", "Ginger", "Soy sauce"], prepTime: 20 },
        { type: "Snack", name: "Protein Shake", calories: 220, protein: 30, carbs: 12, fats: 4, ingredients: ["1 scoop whey protein", "300ml water", "Ice"], prepTime: 2 },
        { type: "Dinner", name: "Roast Chicken with Vegetables", calories: 680, protein: 58, carbs: 52, fats: 20, ingredients: ["250g chicken thigh", "Roasted potatoes", "Broccoli", "Carrots", "Herbs"], prepTime: 45 },
      ],
    },
  ],
  hydrationGoal: 8,
  supplementSuggestions: ["Whey Protein (post-workout)", "Creatine Monohydrate (5g daily)", "Vitamin D3 (2000 IU daily)", "Omega-3 Fish Oil (1g daily)"],
}

export const mockMotivationalMessages = [
  "Crushed it! Every rep you just did is building the athlete you're becoming.",
  "That's what champions do — show up and deliver. Outstanding session!",
  "You just earned your rest. Recovery starts now, gains follow tomorrow.",
  "Another session in the books. The compound effect is working in your favor.",
]

export function getMockMotivationalMessage() {
  return mockMotivationalMessages[Math.floor(Math.random() * mockMotivationalMessages.length)]
}

export function getMockCoachReply(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  if (msg.includes('eat') || msg.includes('food') || msg.includes('meal') || msg.includes('nutrition'))
    return "Great question! Before your workout, aim for a meal with fast-digesting carbs and moderate protein about 60–90 minutes beforehand — something like oats with a protein shake or chicken with rice. Avoid heavy fats right before training as they slow digestion."
  if (msg.includes('hurt') || msg.includes('pain') || msg.includes('sore') || msg.includes('injury'))
    return "Pain is your body's signal — don't push through sharp or joint pain. Swap any pressing movements for cable alternatives that allow a pain-free range of motion. If it persists more than 48 hours, rest that area entirely and consider seeing a physio."
  if (msg.includes('track') || msg.includes('progress') || msg.includes('goal'))
    return "You're doing great! Based on your plan, consistency over the next 4–6 weeks is where you'll really start seeing the compound effect. Make sure you're hitting your protein target daily — that's the single biggest lever for body composition changes."
  if (msg.includes('substitute') || msg.includes('replace') || msg.includes('alternative'))
    return "Good call on swapping. For a push exercise substitute, try cable chest press or push-ups with feet elevated — both hit the same muscles with less joint stress. For a pull substitute, lat pulldown is the safest swap if pull-ups are too demanding today."
  if (msg.includes('squat') || msg.includes('form') || msg.includes('technique'))
    return "For squat form: feet shoulder-width, toes slightly out. Brace your core like you're about to take a punch, chest tall, then push your knees out as you descend. Break parallel if you can. Record a side view to check your depth — it's the fastest way to self-correct."
  if (msg.includes('20') || msg.includes('short') || msg.includes('time') || msg.includes('quick'))
    return "20 minutes? No problem. Prioritise your compound lifts — squat, press, or pull depending on today's focus. Drop accessory work entirely. Do 3 sets of your main lift with 60-second rest periods. Quality over quantity, every time."
  return "That's a solid question. The key principle is progressive overload — keep adding small amounts of weight or reps each week, nail your sleep and protein, and the results will follow. Stay consistent and trust the process. What else can I help you with?"
}
