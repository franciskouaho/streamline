import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type PlanFeature = {
    text: string;
    included: boolean;
};

type SubscriptionPlan = {
    name: string;
    price: string;
    yearlyPrice?: string;
    features: PlanFeature[];
    color: string;
    recommended?: boolean;
};

const subscriptionPlans: SubscriptionPlan[] = [
    {
        name: "Free",
        price: "0€",
        color: "#6B7280",
        features: [
            { text: "Accès à 3 projets maximum", included: true },
            { text: "Fonctionnalités de base (tâches, kanban simple)", included: true },
            { text: "Collaboration avec 2 membres maximum", included: true },
            { text: "Limitation à 50 tâches par projet", included: true },
            { text: "Stockage limité (100 Mo)", included: true },
        ]
    },
    {
        name: "Pro",
        price: "9,99€/mois",
        yearlyPrice: "99€/an",
        color: "#6366F1",
        recommended: true,
        features: [
            { text: "Projets illimités", included: true },
            { text: "Fonctionnalités avancées (Kanban complet, Gantt, tableaux de bord)", included: true },
            { text: "Collaboration avec 5 membres", included: true },
            { text: "Tâches illimitées", included: true },
            { text: "Stockage de 5 Go", included: true },
            { text: "Priorité au support client", included: true },
            { text: "Exportation de données", included: true },
        ]
    },
    {
        name: "Business",
        price: "19,99€/mois",
        yearlyPrice: "199€/an",
        color: "#0EA5E9",
        features: [
            { text: "Tout ce qui est inclus dans Pro", included: true },
            { text: "Nombre illimité de membres", included: true },
            { text: "Fonctionnalités d'administration d'équipe", included: true },
            { text: "Contrôles d'accès avancés", included: true },
            { text: "Stockage de 20 Go", included: true },
            { text: "Intégrations avec d'autres outils d'entreprise", included: true },
            { text: "Support dédié avec temps de réponse garanti", included: true },
            { text: "Rapports et analyses avancés", included: true },
        ]
    }
];

export default function Premium() {
    const router = useRouter();

    const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => (
        <View style={[
            styles.planCard,
            plan.recommended && styles.recommendedCard
        ]}>
            {plan.recommended && (
                <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                {plan.yearlyPrice && (
                    <Text style={styles.yearlyPrice}>ou {plan.yearlyPrice}</Text>
                )}
            </View>
            <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={plan.color}
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: plan.color }]}
                onPress={() => {/* Logique de sélection du plan */}}
            >
                <Text style={styles.selectButtonText}>
                    Sélectionner {plan.name}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Choisissez votre plan</Text>
            </View>
            <ScrollView 
                style={styles.plansContainer}
                showsVerticalScrollIndicator={false}
            >
                {subscriptionPlans.map((plan, index) => (
                    <PlanCard key={index} plan={plan} />
                ))}
                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
    },
    plansContainer: {
        padding: 16,
    },
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    recommendedCard: {
        borderWidth: 2,
        borderColor: '#6366F1',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        right: 24,
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recommendedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    planName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    priceContainer: {
        marginBottom: 24,
    },
    planPrice: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1F2937',
    },
    yearlyPrice: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    featuresContainer: {
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        marginRight: 12,
    },
    featureText: {
        fontSize: 16,
        color: '#4B5563',
        flex: 1,
    },
    selectButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpace: {
        height: 32,
    },
});
