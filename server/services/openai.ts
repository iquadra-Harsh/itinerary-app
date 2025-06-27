import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY_ENV_VAR ||
    "default_key",
});

export interface ItineraryRequest {
  location: string;
  startDate: string;
  endDate: string;
  tripType: string;
  transport: string;
  accommodation: string;
  dining: string;
  ageGroup: string;
  interests: string;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    period: string; // morning, afternoon, evening
    activity: string;
    location: string;
    duration?: string;
    cost?: string;
    notes?: string;
  }[];
}

export interface GeneratedItinerary {
  title: string;
  description: string;
  duration: string;
  days: DayPlan[];
  recommendations: {
    bestPhotoSpots: string[];
    localTips: string[];
    weatherAndPacking: string[];
  };
}

export async function generateItinerary(
  request: ItineraryRequest
): Promise<GeneratedItinerary> {
  const prompt = `Create a detailed travel itinerary given the following:

Location: ${request.location}
Dates: ${request.startDate} to ${request.endDate}
Trip Type: ${request.tripType}
Transportation: ${request.transport}
Accommodation: ${request.accommodation}
Dining Preferences: ${request.dining}
Age Group: ${request.ageGroup}
Interests: ${request.interests}

The itinerary should have:
1. A compelling title and one sentence description
2. Day-by-day detailed plans with specific times, activities, and locations
3. Recommendations for photo spots, local tips, and packing advice

Return the response in JSON format with the following structure:
{
  "title": "Engaging trip title",
  "description": "Brief compelling description",
  "duration": "X Days",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day theme",
      "activities": [
        {
          "time": "10:00 AM",
          "period": "morning",
          "activity": "Activity description",
          "location": "Specific address or landmark",
          "duration": "2-3 hours",
          "cost": "€€€",
          "notes": "Additional helpful information"
        }
      ]
    }
  ],
  "recommendations": {
    "bestPhotoSpots": ["spot1", "spot2", "spot3"],
    "localTips": ["tip1", "tip2", "tip3"],
    "weatherAndPacking": ["weather info", "packing tip1", "packing tip2"]
  }
}

Make sure all activities are realistic, properly timed, and include specific locations with addresses.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content:
            "You are an expert travel planner with extensive knowledge of destinations worldwide. Create detailed, realistic, and engaging travel itineraries based on user preferences. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as GeneratedItinerary;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate itinerary. Please try again.");
  }
}
