import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { translations } = useLanguage();
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
                        <View style={styles.featureIcon}>
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={plan.color}
                            />
                        </View>
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
                <Text style={styles.title}>{translations.premium.title}</Text>
            </View>
            <ScrollView 
                style={styles.plansContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>{translations.premium.description}</Text>

                <View style={styles.featuresContainer}>
                    <Feature 
                        icon="infinite" 
                        text={translations.premium.features.unlimited} 
                    />
                    <Feature 
                        icon="people" 
                        text={translations.premium.features.collaboration} 
                    />
                    <Feature 
                        icon="analytics" 
                        text={translations.premium.features.analytics} 
                    />
                    <Feature 
                        icon="headset" 
                        text={translations.premium.features.support} 
                    />
                </View>
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
        backgroundColor: "#f2f2f2",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
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
        borderRadius: 15,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    recommendedCard: {
        borderWidth: 2,
        borderColor: '#ff7a5c',
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        right: 24,
        backgroundColor: '#ff7a5c',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
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
        color: '#000',
    },
    yearlyPrice: {
        fontSize: 16,
        color: '#666',
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
        width: 32,
        height: 32,
        backgroundColor: '#fff',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    featureText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    selectButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
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
