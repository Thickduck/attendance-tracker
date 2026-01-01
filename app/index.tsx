import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addCounter, addData, course_list, deleteData, readData } from "./util/storage";

export default function Index() {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<course_list[]>([]);
  const [isVisible, setVisible] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');

  const loadData = async () => {
    const storedData = await readData();
    setCourses(storedData || []);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleUpdateScore = async (id: number, delta: number) => {
    await addCounter(id, delta);
    await loadData();
  };

  const handleSubmit = async () => {
    if (!courseName || !credits) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    const creditNum = parseInt(credits);
    let cap = 0;
    if (creditNum === 2) cap = 6;
    else if (creditNum === 3) cap = 10;
    else if (creditNum === 4) cap = 12;
    else {
      Alert.alert("Error", "Credits must be 2, 3, or 4");
      return;
    }

    const newCourse = { id: Date.now(), name: courseName, missed: 0, cap: cap };
    await addData(newCourse);
    await loadData();
    setVisible(false);
    setCourseName('');
    setCredits('');
  };

  return (
    <View style={[styles.body, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>Limit: {item.cap} Skips</Text>
              <TouchableOpacity onPress={async () => {
                Alert.alert("Are you sure?", `Are you sure you want to delete ${item.name}`, [{
                  text: "No",
                  onPress: () => {console.log("Deletion is cancelled")},
                  style: "cancel",
                }, {
                  text: "Yes",
                  onPress: async () => {
                    await deleteData(item.id);
                    await loadData();
                  }, 
                  style: "destructive",
                }])
                
              }} style={{
                borderWidth: 1,
                borderColor: "red",
                alignSelf: "flex-start",
                borderRadius: 10,
                padding: 4,
                marginTop: 4,
              }}>
                <Text style={{
                  color: "red",
                  fontWeight: 600,
                }}>Delete</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.counterGroup}>
              <TouchableOpacity style={styles.miniBtn} onPress={() => handleUpdateScore(item.id, -1)}>
                <Text style={styles.miniBtnText}>-</Text>
              </TouchableOpacity>

              <View style={[styles.circle, { backgroundColor: item.missed >= item.cap ? '#ffebee' : '#f0f0f0' }]}>
                <Text style={[styles.countText, { color: item.missed >= item.cap ? '#d32f2f' : '#000' }]}>
                  {item.missed}
                </Text>
              </View>

              <TouchableOpacity style={styles.miniBtn} onPress={() => handleUpdateScore(item.id, 1)}>
                <Text style={styles.miniBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No courses yet. Tap + to start!</Text>}
      />

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={() => setVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide">
        <View style={[styles.modal, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.modalTitle}>New Course</Text>
          <TextInput placeholder="Course Name" style={styles.input} onChangeText={setCourseName} value={courseName} />
          <TextInput placeholder="Credits (2, 3, 4)" style={styles.input} keyboardType="numeric" onChangeText={setCredits} value={credits} />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#ff3b30' }]} onPress={() => setVisible(false)}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#007AFF' }]} onPress={handleSubmit}>
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800' },
  card: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 20, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSub: { fontSize: 14, color: '#666', marginTop: 4 },
  counterGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 18, fontWeight: 'bold' },
  miniBtn: { width: 35, height: 35, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  miniBtnText: { fontSize: 20, color: '#007AFF' },
  fab: { position: 'absolute', right: 30, backgroundColor: '#000', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 35, fontWeight: '200' },
  modal: { flex: 1, padding: 30 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});