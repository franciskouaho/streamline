import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

interface FeatureItem {
  text: string;
  included: boolean;
  icon?: string;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  yearlyPrice?: string;
  color: string;
  recommended?: boolean;
  features: FeatureItem[];
}

interface FeatureProps {
  icon: string;
  text: string;
}

const Feature = ({ icon, text }: FeatureProps) => (
  <View style={styles.featureHighlight}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#ff7a5c" />
    </View>
    <Text style={styles.featureHighlightText}>{text}</Text>
  </View>
);

export default function Premium() {
    const { translations } = useLanguage();
    const router = useRouter();

    const subscriptionPlans: SubscriptionPlan[] = [
        {
            name: "Pro",
            price: "9,99€/mois",
            yearlyPrice: "99€/an",
            color: "#6366F1",
            recommended: true,
            features: [
                { text: translations.premium.features.unlimited, included: true, icon: "infinite" },
                { text: translations.premium.features.unlimitedTasks, included: true, icon: "list" },
                { text: translations.premium.features.unlimitedMembers, included: true, icon: "people" },
                { text: translations.premium.features.advancedFeatures, included: true, icon: "construct" },
                { text: translations.premium.features.storage, included: true, icon: "cloud-upload" },
                { text: translations.premium.features.support, included: true, icon: "headset" },
                { text: translations.premium.features.dataExport, included: true, icon: "download" },
                { text: translations.premium.features.analytics, included: true, icon: "analytics" },
            ]
        },
        // Plan Business mis en commentaire pour utilisation future
        /*
        {
            name: "Business",
            price: "19,99€/mois",
            yearlyPrice: "199€/an",
            color: "#0EA5E9",
            features: [
                // ...features...
            ]
        }
        */
    ];

    // FAQ section data
    const faqItems = [
        { 
            question: translations.premium.faq.q1, 
            answer: translations.premium.faq.a1 
        },
        { 
            question: translations.premium.faq.q2, 
            answer: translations.premium.faq.a2 
        },
        { 
            question: translations.premium.faq.q3, 
            answer: translations.premium.faq.a3 
        },
    ];

    const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => (
        <View style={[
            styles.planCard,
            plan.recommended && styles.recommendedCard
        ]}>
            {plan.recommended && (
                <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>{translations.premium.recommended}</Text>
                </View>
            )}
            <LinearGradient
                colors={['#6366F1', '#818cf8']}
                style={styles.planHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    {plan.yearlyPrice && (
                        <Text style={styles.yearlyPrice}>{translations.premium.or} {plan.yearlyPrice}</Text>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.currentPlanInfo}>
                <Text style={styles.currentPlanText}>{translations.premium.current}</Text>
                <Text style={styles.freeInfo}>{translations.premium.freeInfo}</Text>
            </View>
            
            <Text style={styles.featuresTitle}>{translations.premium.featuresIncluded}</Text>
            
            <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Ionicons
                                name={feature.icon || "checkmark-circle"}
                                size={20}
                                color={plan.color}
                            />
                        </View>
                        <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                ))}
            </View>
            
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {/* Logique de sélection du plan */}}
            >
                <LinearGradient
                    colors={['#6366F1', '#818cf8']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={styles.selectButtonText}>
                        {translations.premium.subscribe} {plan.name}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const FaqItem = ({ item, index }: { item: { question: string, answer: string }, index: number }) => {
        const [expanded, setExpanded] = React.useState(false);
        
        return (
            <View style={styles.faqItem}>
                <TouchableOpacity 
                    style={styles.faqQuestion} 
                    onPress={() => setExpanded(!expanded)}
                >
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                    <Ionicons 
                        name={expanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#000"
                    />
                </TouchableOpacity>
                {expanded && (
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
            </View>
        );
    };

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
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section with Icon instead of Image */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIconContainer}>
                        <LinearGradient
                            colors={['#6366F1', '#818cf8', '#c084fc']}
                            style={styles.iconGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="star" size={64} color="#fff" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.heroTitle}>{translations.premium.heroTitle}</Text>
                    <Text style={styles.description}>{translations.premium.description}</Text>
                </View>

                {/* Top Features */}
                <View style={styles.topFeaturesContainer}>
                    <Text style={styles.sectionTitle}>{translations.premium.topFeatures}</Text>
                    <View style={styles.featuresGrid}>
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
                </View>
                
                {/* Plans */}
                <View style={styles.plansContainer}>
                    <Text style={styles.sectionTitle}>{translations.premium.choosePlan}</Text>
                    {subscriptionPlans.map((plan, index) => (
                        <PlanCard key={index} plan={plan} />
                    ))}
                </View>

                {/* Testimonials */}
                <View style={styles.testimonialsSection}>
                    <Text style={styles.sectionTitle}>{translations.premium.testimonials}</Text>
                    <View style={styles.testimonialCard}>
                        <View style={styles.testimonialHeader}>
                            <View style={styles.testimonialIconContainer}>
                                <Ionicons name="chatbubble-ellipses" size={24} color="#6366F1" />
                            </View>
                        </View>
                        <Text style={styles.testimonialText}>"{translations.premium.testimonial1}"</Text>
                        <Text style={styles.testimonialAuthor}>- {translations.premium.testimonialAuthor1}</Text>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <View style={styles.faqHeader}>
                        <View style={styles.faqIconContainer}>
                            <Ionicons name="help-circle" size={28} color="#6366F1" />
                        </View>
                        <Text style={styles.sectionTitle}>{translations.premium.faqTitle}</Text>
                    </View>
                    {faqItems.map((item, index) => (
                        <FaqItem key={index} item={item} index={index} />
                    ))}
                </View>
                
                {/* Button at bottom to encourage subscription */}
                <TouchableOpacity
                    style={styles.bottomCTA}
                    onPress={() => {/* Action d'abonnement */}}
                >
                    <LinearGradient
                        colors={['#6366F1', '#818cf8']}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.bottomCTAText}>{translations.premium.getStarted}</Text>
                        <Ionicons name="arrow-forward" size={22} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
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
    scrollView: {
        flex: 1,
    },
    heroSection: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    heroIconContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#1e293b',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#64748b',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1e293b',
        textAlign: 'center',
    },
    topFeaturesContainer: {
        padding: 20,
        marginBottom: 20,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    plansContainer: {
        padding: 20,
        marginBottom: 20,
    },
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    recommendedCard: {
        borderWidth: 2,
        borderColor: '#6366F1',
        transform: [{ scale: 1.02 }],
    },
    recommendedBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        zIndex: 1,
    },
    recommendedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    planHeader: {
        padding: 20,
    },
    planName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    priceContainer: {
        alignItems: 'center',
    },
    planPrice: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
    },
    yearlyPrice: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    currentPlanInfo: {
        backgroundColor: '#f1f5f9',
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#cbd5e1',
    },
    currentPlanText: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
        color: '#334155',
    },
    freeInfo: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginLeft: 20,
        marginBottom: 10,
        color: '#334155',
    },
    featuresContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    featureIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    selectButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 30,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    featureHighlight: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    featureHighlightText: {
        fontSize: 14,
        color: '#334155',
        textAlign: 'center',
        fontWeight: '500',
    },
    testimonialsSection: {
        padding: 20,
        marginBottom: 20,
    },
    testimonialHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    testimonialIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    testimonialCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    testimonialText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#334155',
        lineHeight: 24,
        marginBottom: 10,
    },
    testimonialAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'right',
    },
    faqSection: {
        padding: 20,
        marginBottom: 20,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    faqIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    faqItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'hidden',
    },
    faqQuestion: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        flex: 1,
    },
    faqAnswer: {
        padding: 16,
        paddingTop: 0,
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    bottomCTA: {
        marginHorizontal: 40,
        marginVertical: 20,
        borderRadius: 30,
        overflow: 'hidden',
    },
    bottomCTAText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginRight: 10,
    },
    gradientButton: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSpace: {
        height: 40,
    },
});
