import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useLoginInfo, logout } from '../../redux/store';
import { useRouter } from 'expo-router';
import memberApi, { MemberImgDTO } from '../../apis/member_api';
import SetProfileImage from '~/components/SetProfileImage';
import { axiosInstance } from '../../apis/axios_instance';
import { apiHost } from '~/lib/app_config';

export default function ProfilePage() {
  const loginInfo = useLoginInfo();
  const router = useRouter();
  const [profileImg, setProfileImg] = useState<MemberImgDTO | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
    Alert.alert('로그아웃되었습니다.');
    router.replace('/auth/login');
  };

  // 프로필 이미지 조회
  const loadProfileImg = async () => {
    try {
      const result = await memberApi.getProfileImg();
      setProfileImg(result);
    } catch (error) {
      console.error('프로필 이미지 불러오기 실패:', error);
      Alert.alert('프로필 이미지 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loginInfo) {
      loadProfileImg();
    }
  }, [loginInfo]);

  // 서버에서 사용할 이미지 URL 구성
  const getProfileImageUrl = (): string | null => {
    if (previewUri) return previewUri;
    if (profileImg?.attachedFileName) {
      return `${apiHost}/uploads/${profileImg.attachedFileName}`;
    }
    return null;
  };

  // 프로필 이미지 변경 처리
  const handleImageChange = async (uri: string) => {
    try {
      setPreviewUri(uri);

      // 1. 이미지 업로드
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const uploadRes = await axiosInstance.post<{
        originFileName: string;
        attachedFileName: string;
      }>('/member/profile-img/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { originFileName, attachedFileName } = uploadRes.data;

      // 2. DB에 insert 또는 update
      if (profileImg?.imgId) {
        await memberApi.updateProfileImg({
          imgId: profileImg.imgId,
          memberId: profileImg.memberId,
          originFileName,
          attachedFileName,
        });
      } else {
        await memberApi.insertProfileImg({ originFileName, attachedFileName });
      }

      Alert.alert('프로필 이미지가 변경되었습니다.');
      setPreviewUri(null);
      loadProfileImg();
    } catch (error) {
      console.error('이미지 변경 실패:', error);
      Alert.alert('이미지 변경 실패', '다시 시도해주세요.');
    }
  };

  if (!loginInfo) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Pressable onPress={() => router.push('/auth/login')}>
          <Text className="font-bold text-lg">로그인 정보가 없습니다.</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F3F4F6] px-6 pt-14">
    {/* 타이틀 */}
    <Text className="text-2xl font-bold text-center text-green-700 mb-6">
      PROFILE
    </Text>

    {/* 프로필 카드 */}
    <View className="bg-white rounded-2xl shadow-lg px-6 py-8 items-center mb-6">
      {/* 프로필 이미지 */}
      {!loading && (
        <SetProfileImage imageUrl={getProfileImageUrl()} onChange={handleImageChange} />
      )}

      {/* 이름 */}
      <Text className="text-xl font-semibold text-gray-800 mt-4 mb-1">
        {loginInfo.name} 님 
      </Text>

      {/* 라벨 */}
      <Text className="text-sm text-gray-500 mb-4">스마트팜 관리자</Text>

      {/* 정보 목록 */}
      <View className="w-full space-y-3">
        <View className="flex-row justify-between border-b border-gray-200 pb-2">
          <Text className="text-gray-500 font-medium">아이디</Text>
          <Text className="text-gray-800">{loginInfo.loginId}</Text>
        </View>
        <View className="flex-row justify-between border-b border-gray-200 pb-2">
          <Text className="text-gray-500 font-medium">연락처</Text>
          <Text className="text-gray-800">{loginInfo.tell}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-500 font-medium">이메일</Text>
          <Text className="text-gray-800">{loginInfo.email}</Text>
        </View>
      </View>
    </View>

    {/* 로그아웃 버튼 */}
    <Pressable
      onPress={handleLogout}
      className="bg-green-600 rounded-xl py-3 shadow-md active:opacity-80"
    >
      <Text className="text-white text-lg font-bold text-center">로그아웃</Text>
    </Pressable>
  </View>
  );
}