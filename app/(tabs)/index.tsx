import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const NGROK_URL = "https://unascendent-underfoot-tessa.ngrok-free.dev"; // <-- keep your working URL here

export default function LessonPlanScreen() {
  // HEADER INFORMATION
  const [school, setSchool] = useState("");
  const [teacher, setTeacher] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [quarter, setQuarter] = useState("");
  const [week, setWeek] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // OBJECTIVES
  const [learningCompetencies, setLearningCompetencies] = useState("");

  // CONTENT
  const [topicTitle, setTopicTitle] = useState("");

  // ADDITIONAL INFORMATION
  const [timeAllotted, setTimeAllotted] = useState("");
  const [resourcesAvailable, setResourcesAvailable] = useState("");
  const [previousLesson, setPreviousLesson] = useState("");

  // OUTPUT
  const [lessonPlan, setLessonPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const allRequiredFilled = [
    school,
    teacher,
    gradeLevel,
    subject,
    quarter,
    week,
    day,
    learningCompetencies,
    topicTitle,
    timeAllotted,
  ].every((v) => v.trim().length > 0);


  const handleGenerate = async () => {
    if (!allRequiredFilled || loading) return;

    setLoading(true);
    setLessonPlan("");

    // Build a structured description to send to the backend
    const lessonInfo = `
HEADER INFORMATION
- School: ${school}
- Teacher: ${teacher}
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Quarter: ${quarter}
- Week: ${week}
- Day: ${day}
- Date: ${date}

OBJECTIVES
- Learning competencies (MELCs): ${learningCompetencies}

CONTENT
- Topic / Lesson Title: ${topicTitle}

ADDITIONAL INFORMATION
- Time Allotted: ${timeAllotted}
- Resources Available: ${resourcesAvailable || "Not specified"}
- Previous Lesson: ${previousLesson || "Not specified"}
    `.trim();

    const prompt = `
You are an expert ${subject} teacher. Using the information below, create a detailed and classroom-ready lesson plan.

Requirements:
- Use clear sections such as: I. Objectives, II. Subject Matter / Content, III. Learning Activities, IV. Assessment, V. Assignment/Enrichment.
- Align the objectives with the given learning competencies (MELCs).
- Make activities age-appropriate for Grade ${gradeLevel}.
- Use bullet points and numbering where helpful.
- Keep the tone professional but easy for teachers to follow.

Here is the lesson information provided by the teacher:

${lessonInfo}
    `.trim();

    try {
      const response = await fetch(`${NGROK_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setLessonPlan(
        data.reply ??
          "Sorry, I couldn't generate a lesson plan. Please try again."
      );
    } catch (err) {
      console.error(err);
      setLessonPlan(
        "Oops, something went wrong talking to Google AI. Check your connection or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!lessonPlan) return;

    try {
      await Clipboard.setStringAsync(lessonPlan);
      Alert.alert("Copied", "Lesson plan copied to clipboard.");
    } catch (error) {
      console.error("Copy failed:", error);
      Alert.alert("Error", "Failed to copy to clipboard.");
    }
  };

  // Date picker handler
  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setDate(formatted);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Lesson Plan Generator</Text>
            <Text style={styles.headerSubtitle}>
              Fill in the lesson details and let Google AI generate a complete
              lesson plan for you.
            </Text>
          </View>

          {/* HEADER INFORMATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Header Information</Text>

            <Field
              label="School"
              value={school}
              onChangeText={setSchool}
              placeholder="e.g., Sample National High School"
            />

            <Field
              label="Teacher"
              value={teacher}
              onChangeText={setTeacher}
              placeholder="e.g., Juan Dela Cruz"
            />

            {/* Grade Level DROPDOWN */}
            <DropdownField
              label="Grade Level"
              selectedValue={gradeLevel}
              onValueChange={setGradeLevel}
              placeholder="Select grade level"
              options={[
                { label: "Grade 7", value: "Grade 7" },
                { label: "Grade 8", value: "Grade 8" },
                { label: "Grade 9", value: "Grade 9" },
                { label: "Grade 10", value: "Grade 10" },
                { label: "Grade 11", value: "Grade 11" },
                { label: "Grade 12", value: "Grade 12" },
              ]}
            />

            <Field
              label="Subject"
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g., Science"
            />

            {/* Quarter DROPDOWN */}
            <DropdownField
              label="Quarter"
              selectedValue={quarter}
              onValueChange={setQuarter}
              placeholder="Select quarter"
              options={[
                { label: "1st Quarter", value: "1st Quarter" },
                { label: "2nd Quarter", value: "2nd Quarter" },
                { label: "3rd Quarter", value: "3rd Quarter" },
                { label: "4th Quarter", value: "4th Quarter" },
              ]}
            />

            {/* Week DROPDOWN */}
            <DropdownField
              label="Week"
              selectedValue={week}
              onValueChange={setWeek}
              placeholder="Select week"
              options={Array.from({ length: 10 }, (_, i) => ({
                label: `Week ${i + 1}`,
                value: `Week ${i + 1}`,
              }))}
            />

            {/* Day DROPDOWN */}
            <DropdownField
              label="Day"
              selectedValue={day}
              onValueChange={setDay}
              placeholder="Select day"
              options={[
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
              ]}
            />

            {/* DATE PICKER */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    date ? styles.dateText : [styles.dateText, styles.datePlaceholder]
                  }
                >
                  {date || "Tap to select date"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date ? new Date(date) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>

          {/* OBJECTIVES */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Objectives</Text>
            <Field
              label="Learning competencies (MELCs)"
              value={learningCompetencies}
              onChangeText={setLearningCompetencies}
              placeholder="Write or paste the MELCs here..."
              multiline
            />
          </View>

          {/* CONTENT */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Content</Text>
            <Field
              label="Topic / Lesson Title"
              value={topicTitle}
              onChangeText={setTopicTitle}
              placeholder="e.g., The Structure of the Earth"
            />
          </View>

          {/* ADDITIONAL INFORMATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            {/* Time Allotted DROPDOWN */}
            <DropdownField
              label="Time Allotted"
              selectedValue={timeAllotted}
              onValueChange={setTimeAllotted}
              placeholder="Select time"
              options={[
                { label: "30 minutes", value: "30 minutes" },
                { label: "45 minutes", value: "45 minutes" },
                { label: "60 minutes", value: "60 minutes" },
                { label: "90 minutes", value: "90 minutes" },
              ]}
            />

            <Field
              label="Resources Available"
              value={resourcesAvailable}
              onChangeText={setResourcesAvailable}
              placeholder="e.g., textbook, projector, worksheets"
              multiline
            />
            <Field
              label="Previous Lesson"
              value={previousLesson}
              onChangeText={setPreviousLesson}
              placeholder="e.g., Introduction to the Solar System"
              multiline
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!allRequiredFilled || loading) && styles.buttonDisabled,
            ]}
            onPress={handleGenerate}
            disabled={!allRequiredFilled || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.buttonText}>Generate Lesson Plan</Text>
            )}
          </TouchableOpacity>

          {/* Output */}
          <View style={[styles.card, { marginBottom: 32 }]}>
            <Text style={styles.sectionTitle}>Generated Lesson Plan</Text>
            {lessonPlan ? (
              <>
                <Text style={styles.outputText}>{lessonPlan}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.placeholderOutput}>
                The generated lesson plan will appear here after you click
                "Generate Lesson Plan".
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable text field component
type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: FieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        multiline={multiline}
      />
    </View>
  );
}

// New dropdown component
type DropdownFieldProps = {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
};

function DropdownField({
  label,
  selectedValue,
  onValueChange,
  placeholder,
  options,
}: DropdownFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue || ""}
          onValueChange={(val) => {
            if (val !== "") onValueChange(val);
          }}
          dropdownIconColor="#9ca3af"
        >
          <Picker.Item
            label={placeholder || "Select an option"}
            value=""
            color="#6b7280"
          />
          {options.map((opt) => (
            <Picker.Item
              key={opt.value}
              label={opt.label}
              value={opt.value}
              // color="#f9fafb"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#0b1120",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderRadius: 10,
    backgroundColor: "#0b1120",
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },
  button: {
    marginTop: 16,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ecfeff",
    fontWeight: "600",
    fontSize: 15,
  },
  outputText: {
    marginTop: 4,
    fontSize: 14,
    color: "#f9fafb",
    lineHeight: 20,
  },
  placeholderOutput: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },
  copyButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  dateInput: {
    borderRadius: 10,
    backgroundColor: "#0b1120",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  dateText: {
    fontSize: 14,
    color: "#f9fafb",
  },
  datePlaceholder: {
    color: "#6b7280",
    fontStyle: "italic",
  },
});
