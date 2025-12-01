import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";

type Country = {
  name: { common: string; official: string };
  capital?: string[];
  population: number;
  region: string;
  flags: { png: string };
  cca3: string;
};

const API_BASE = "https://restcountries.com/v3.1";

export default function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    try {
      const res = await fetch(
        `${API_BASE}/all?fields=name,capital,population,region,flags,cca3`
      );
      const data: Country[] = await res.json();
      const sorted = data.sort((a, b) => 
        a.name.common.localeCompare(b.name.common)
      );
      setCountries(sorted);
    } catch (error) {
      console.error("Erro ao carregar países:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = query
    ? countries.filter((c) =>
        c.name.common.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) {
      return `${(pop / 1000000).toFixed(1)}M`;
    } else if (pop >= 1000) {
      return `${(pop / 1000).toFixed(0)}K`;
    }
    return pop.toString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.muted}>Carregando países...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌍 Países do Mundo</Text>
        <Text style={styles.headerSubtitle}>{countries.length} países</Text>
      </View>

      <TextInput
        placeholder="Buscar país..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.cca3}
        onRefresh={load}
        refreshing={refreshing}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum país encontrado.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.flags.png }}
              style={styles.flag}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.countryName}>{item.name.common}</Text>
              <Text style={styles.capital}>
                {item.capital?.[0] || "Sem capital"}
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  👥 {formatPopulation(item.population)}
                </Text>
                <Text style={styles.infoText}>🌎 {item.region}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { color: "#666", marginTop: 8 },
  header: {
    backgroundColor: "#FFF",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#000" },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  input: {
    margin: 16,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    borderColor: "#DDD",
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderColor: "#EEE",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flag: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 12, justifyContent: "center" },
  countryName: { fontWeight: "700", fontSize: 16, color: "#000", marginBottom: 4 },
  capital: { color: "#666", fontSize: 14, marginBottom: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoText: { color: "#444", fontSize: 13 },
  emptyText: { textAlign: "center", color: "#666", marginTop: 32, fontSize: 16 },
});