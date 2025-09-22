import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export default function TestScreen() {
    return (
        <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>⚽ App Fútbol</Text>
                <Text style={styles.subtitle}>¡Funcionando correctamente!</Text>
                <Text style={styles.description}>
                    Tu aplicación de gestión de torneos de fútbol está lista.
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        opacity: 0.9,
    },
});