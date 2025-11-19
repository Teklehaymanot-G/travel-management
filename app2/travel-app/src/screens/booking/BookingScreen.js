import { FieldArray, Formik } from "formik";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";
// import TravelerForm from "../../components/booking/TravelerForm";
import AppButton from "../../components/common/AppButton.js";
import { createBooking } from "../../services/bookingService";
import theme from "../../config/theme";
import TravelerForm from "../../components/booking/TravelerForm";

const validationSchema = Yup.object().shape({
  travelers: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Name is required"),
      ageGroup: Yup.string().required("Age group is required"),
      gender: Yup.string()
        .oneOf(["Male", "Female"])
        .required("Gender is required"),
    })
  ),
});

const BookingScreen = ({ route, navigation }) => {
  const { travel } = route.params;
  const [travelerCount, setTravelerCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (values) => {
    setErrorMessage("");
    try {
      const res = await createBooking({
        travelId: travel.id,
        travelers: values.travelers,
      });
      const booking = res?.data || res;
      if (!booking?.id) {
        throw new Error("Booking failed");
      }
      navigation.navigate("Payment", { booking });
    } catch (e) {
      setErrorMessage(
        e.message || "Failed to create booking. Please login and retry."
      );
    }
  };

  const initialValues = {
    travelers: Array.from({ length: travelerCount }).map(() => ({
      name: "",
      ageGroup: "",
      gender: "",
    })),
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Your Trips</Text>
        <Text style={styles.subtitle}>{travel.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travelers</Text>
        <View style={styles.counter}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setTravelerCount(Math.max(1, travelerCount - 1))}
            disabled={travelerCount <= 1}
          >
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.count}>{travelerCount}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setTravelerCount(travelerCount + 1)}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <>
            <View style={styles.travelersContainer}>
              <FieldArray name="travelers">
                {() => (
                  <>
                    {Array.from({ length: travelerCount }).map((_, index) => (
                      <TravelerForm
                        key={index}
                        index={index}
                        values={values}
                        setFieldValue={setFieldValue}
                      />
                    ))}
                  </>
                )}
              </FieldArray>
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trip Price</Text>
                <Text style={styles.summaryValue}>
                  ${travel.price} x {travelerCount}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes & Fees</Text>
                <Text style={styles.summaryValue}>$0</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${travel.price * travelerCount}
                </Text>
              </View>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <AppButton
              title="Continue to Payment"
              onPress={handleSubmit}
              style={styles.button}
            />
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.m,
  },
  header: {
    marginBottom: theme.spacing.l,
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  subtitle: {
    fontSize: theme.fontSize.large,
    color: theme.colors.gray,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.xs,
  },
  counterButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
  },
  counterText: {
    fontSize: theme.fontSize.xlarge,
    color: theme.colors.primary,
  },
  count: {
    fontSize: theme.fontSize.medium,
    fontWeight: "bold",
    marginHorizontal: theme.spacing.m,
    minWidth: 20,
    textAlign: "center",
  },
  travelersContainer: {
    marginBottom: theme.spacing.l,
  },
  summary: {
    backgroundColor: theme.colors.light,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.s,
  },
  summaryLabel: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
  },
  summaryValue: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.dark,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: theme.colors.gray,
    paddingTop: theme.spacing.s,
    marginTop: theme.spacing.s,
  },
  totalLabel: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  totalValue: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  button: {
    marginVertical: theme.spacing.m,
  },
});

export default BookingScreen;
