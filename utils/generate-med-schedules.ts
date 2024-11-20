import { MedicationTaskSchedule, Time } from "@/lib/types";
import { createClient } from "./supabase/server";

const generateMedicationSchedules = async (
  medicationTaskId: number,
  times: Time[],
  endDate: Date,
) => {
  const supabase = createClient()

  const schedules: Partial<MedicationTaskSchedule>[] = [];
  let currentDate = new Date();

  while (currentDate <= endDate) {
    times.forEach((time) => {
      const scheduleTime = {
        hour: time.hour,
        minute: time.minute,
        period: time.period,
      };

      schedules.push({
        medicationTaskId,
        time: scheduleTime,
        isTaken: false,
      });
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insert the generated schedules into the database
  const { error } = await supabase
    .from("MedicationTaskSchedule")
    .insert(schedules);

  if (error) throw new Error(error.message);
};

