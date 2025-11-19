import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import theme from "../../config/theme";

const AGE_GROUPS = ["<10", "10-18", "18-35", "35-50", ">50"];
const GENDERS = ["Male", "Female"];

const Segment = ({ options, value, onChange }) => (
  <View style={styles.segmentRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        onPress={() => onChange(opt)}
        style={[styles.segmentBtn, value === opt && styles.segmentBtnActive]}
      >
        <Text
          style={[
            styles.segmentText,
            value === opt && styles.segmentTextActive,
          ]}
        >
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const TravelerForm = ({ index, values, setFieldValue, errors, touched }) => {
  const path = (field) => `travelers[${index}].${field}`;
  const v = values.travelers?.[index] || {};

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Traveler {index + 1}</Text>
      <TextInput
        placeholder="Full name"
        value={v.name || ""}
        onChangeText={(text) => setFieldValue(path("name"), text)}
        style={styles.input}
      />
      <Text style={styles.label}>Age Group</Text>
      <Segment
        options={AGE_GROUPS}
        value={v.ageGroup}
        onChange={(opt) => setFieldValue(path("ageGroup"), opt)}
      />
      <Text style={styles.label}>Gender</Text>
      <Segment
        options={GENDERS}
        value={v.gender}
        onChange={(opt) => setFieldValue(path("gender"), opt)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
  },
  label: {
    color: theme.colors.gray,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segmentText: {
    color: theme.colors.dark,
  },
  segmentTextActive: {
    color: theme.colors.white,
    fontWeight: "bold",
  },
});

export default TravelerForm;
export { AGE_GROUPS, GENDERS };
