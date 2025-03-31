import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

const DashboardCharts = () => {
  const screenWidth = Dimensions.get("window").width - 60; // Augmentation de la marge
  
  const lineChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [2, 4.5, 3, 5.5, 6.5, 4, 1],
        color: () => "#43d2c3", // Completed color
        strokeWidth: 2,
      },
      {
        data: [3, 2, 4, 4.5, 4, 6, 5],
        color: () => "#ffb443", // In Process color
        strokeWidth: 2,
      },
    ],
    legend: ["Completed", "In Process"],
  };

  const barChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [4.5, 5.5, 4.5, 6.5, 4.5, 2.5, 3.7],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
    },
  };

  const lineChartStyle = {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
    alignSelf: 'center', // Centrer le graphique
  };

  const barChartStyle = {
    ...lineChartStyle,
    paddingRight: 0,
  };
  
  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(255, 122, 92, ${opacity})`, // Using the coral color from your scheme
    barPercentage: 0.8,
  };

  return (
    <View style={styles.chartsContainer}>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Daily tasks overview</Text>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownText}>Weekly</Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </View>
        </View>
        <LineChart
          data={lineChartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={lineChartStyle}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          fromZero={true}
          yAxisInterval={2}
          segments={4}
          yAxisLabel=""
          yAxisSuffix=""
          hidePointsAtIndex={[]}
          renderDotContent={({ x, y, index, indexData }) => null}
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#ffb443" }]} />
            <Text style={styles.legendText}>In Process</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#43d2c3" }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>Project overview</Text>
            <Text style={styles.chartSubtitle}>Avg project daily</Text>
          </View>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownText}>Weekly</Text>
            <Ionicons name="chevron-down" size={16} color="#999" />
          </View>
        </View>
        <BarChart
          data={barChartData}
          width={screenWidth}
          height={220}
          chartConfig={barChartConfig}
          style={barChartStyle}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          fromZero={true}
          showBarTops={false}
          flatColor={true}
          segments={4}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  chartSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 14,
    color: "#999",
    marginRight: 4,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});

export default DashboardCharts;