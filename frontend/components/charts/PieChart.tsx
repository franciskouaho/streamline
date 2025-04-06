import React from 'react';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// Fonction de sécurité pour s'assurer que les données sont valides
const validateChartData = (data) => {
  // Vérifier si les données sont valides
  if (!data || !Array.isArray(data) || data.length === 0) {
    // Renvoyer des données factices si les données fournies ne sont pas valides
    return [
      {
        name: 'Aucune donnée',
        population: 1,
        color: '#cccccc',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }
    ];
  }

  // Filtrer les éléments avec des valeurs non numériques
  return data.filter(item => {
    const value = Number(item.population);
    return !isNaN(value) && value > 0;
  });
};

const ProjectPieChart = ({ data, width, height }) => {
  const { colors } = useTheme();
  const screenWidth = width || Dimensions.get('window').width;
  
  // Valider les données pour éviter les NaN
  const validData = validateChartData(data);
  
  // Si après validation, il n'y a plus de données, afficher un message
  if (validData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>Aucune donnée disponible</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <PieChart
      data={validData}
      width={screenWidth}
      height={height || 220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
  );
};

const styles = StyleSheet.create({
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
  }
});

export default ProjectPieChart;
