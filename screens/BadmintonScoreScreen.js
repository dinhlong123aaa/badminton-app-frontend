// BadmintonScoreScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from 'react-native';

const BadmintonScoreScreen = () => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(1);
  const POINTS_TO_WIN = 21;

  const handleScore = (player) => {
    if (player === 1) {
      setScore1(score1 + 1);
      checkWin(score1 + 1, score2);
    } else {
      setScore2(score2 + 1);
      checkWin(score1, score2 + 1);
    }
  };

  const checkWin = (s1, s2) => {
    if ((s1 >= POINTS_TO_WIN || s2 >= POINTS_TO_WIN) && Math.abs(s1 - s2) >= 2) {
      const winner = s1 > s2 ? 'Người chơi 1' : 'Người chơi 2';
      Alert.alert(
        'Hết hiệp',
        `${winner} chiến thắng!`,
        [
          {
            text: 'Hiếp tiếp theo',
            onPress: () => {
              setSets([...sets, { score1: s1, score2: s2 }]);
              setScore1(0);
              setScore2(0);
              setCurrentSet(currentSet + 1);
            }
          }
        ]
      );
    }
  };

  const resetGame = () => {
    Alert.alert(
      'Bắt đầu lại',
      'Bạn có muốn bắt đầu lại trận đấu mới?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bắt đầu lại',
          onPress: () => {
            setScore1(0);
            setScore2(0);
            setSets([]);
            setCurrentSet(1);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Badminton Score</Text>
        <Text style={styles.setInfo}>Hiệp {currentSet}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.playerSection}>
          <Text style={styles.playerName}>Người chơi 1</Text>
          <Text style={styles.score}>{score1}</Text>
          <TouchableOpacity
            style={styles.scoreButton}
            onPress={() => handleScore(1)}
          >
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.playerSection}>
          <Text style={styles.playerName}>Người chơi 2</Text>
          <Text style={styles.score}>{score2}</Text>
          <TouchableOpacity
            style={styles.scoreButton}
            onPress={() => handleScore(2)}
          >
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sets.length > 0 && (
        <View style={styles.setsContainer}>
          <Text style={styles.setsTitle}>Kết quả các hiệp</Text>
          {sets.map((set, index) => (
            <Text key={index} style={styles.setScore}>
              Set {index + 1}: {set.score1} - {set.score2}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetGame}
      >
        <Text style={styles.resetButtonText}>Bắt đầu lại trận đấu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  setInfo: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 20,
  },
  playerSection: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
  },
  scoreButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
  setsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    elevation: 2,
  },
  setsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  setScore: {
    fontSize: 16,
    color: '#666',
    marginVertical: 4,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default BadmintonScoreScreen;