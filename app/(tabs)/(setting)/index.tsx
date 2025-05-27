import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import PageLayout from '~/components/PageLayout';
import { logout } from '~/redux/store';
import { router } from 'expo-router';

const handleLogout = async () => {
  await logout(); // 서버 요청 + SecureStore 삭제 + 스토어 초기화
  Alert.alert('로그아웃되었습니다.');
  router.replace('/auth/login'); // 로그인 화면으로 이동
};

// /auth/profile_page
const MyPageIndex = () => {
  return (
    <PageLayout>
      <View className="flex-1 pt-[80px] bg-gray-100 px-4">
        {/* 메뉴 리스트 */}
        <View style={styles.menuBox}>
          <Pressable style={styles.menuItem} onPress={()=>{router.push('/auth/profile_page')}}>
            <Text style={styles.menuText}>마이페이지관리</Text>
          </Pressable>
          <View style={styles.divider} />
          
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>마이서비스관리</Text>
          </Pressable>
          <View style={styles.divider} />

        </View>

        {/* 설정 메뉴 */}
        <View style={styles.menuBox}>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>지역설정</Text>
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>버전정보</Text>
          </Pressable>
        </View>

      </View>
    </PageLayout>
  );
};

export default MyPageIndex;

const styles = StyleSheet.create({
  menuBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3, // 안드로이드 그림자
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },

});
