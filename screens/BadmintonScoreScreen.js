// BadmintonScoreScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const BadmintonScoreScreen = () => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(1);
  const POINTS_TO_WIN = 21;

  const handleScore = (player) => {
    if (player === 1) {
      setScore1(score1 + 1);
    } else {
      setScore2(score2 + 1);
    }

    // Check for set win
    if (score1 >= POINTS_TO_WIN || score2 >= POINTS_TO_WIN) {
      if (Math.abs(score1 - score2) >= 2) {
        setSets([...sets, { score1, score2 }]);
        setScore1(0);
        setScore2(0);
        setCurrentSet(currentSet + 1);
      }
    }
  };

  const resetGame = () => {
    setScore1(0);
    setScore2(0);
    setSets([]);
    setCurrentSet(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Badminton Score</Text>
        <Text style={styles.setInfo}>Set {currentSet}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.playerSection}>
          <Text style={styles.playerName}>Người chơi 1</Text>
          <Text style={styles.score}>{score1}</Text>
          <TouchableOpacity
            style={styles.scoreButton}
            onPress={() => handleScore(1)}
            activeOpacity={0.7}
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
            activeOpacity={0.7}
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
        activeOpacity={0.7}
      >
        <Text style={styles.resetButtonText}>Bắt đầu lại trận đấu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.communityButton}
        onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61569270992841&mibextid=ZbWKwL')}
        activeOpacity={0.7}
      >
        <Icon name="users" size={18} color="#007AFF" />
        <Text style={styles.communityButtonText}>
          Tham gia cộng đồng, tìm người đánh chung?
        </Text>
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
  communityButton: {
    backgroundColor: '#fff',
    padding: 16,
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  communityButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
});

export default BadmintonScoreScreen;