import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  ja: {
    translation: {
      homePage: "ホームページ",
      "materials-management": "マテリアル管理",
      "list-materials": "物資のリスト",
      "user-management": "ユーザー管理",
      statiscis: "統計",
      "qr-code-manager": "機器の引き継ぎ",
      "add-new-user": "ユーザーを追加する",
      "category-management": "カテゴリ管理",
      "equip-handover": "機器の引き継ぎ",
      "list-users": "ユーザーアカウントのリスト",
      "add-user": "ユーザーを追加する",
      delete: "消去",
      "confirm-delete": "削除を確認しますか?",
      confirm: "確認する",
      cancel: "キャンセル",
      "delete-success": "正常に削除されました",
      "delete-failed": "削除に失敗しました",
      username: "ユーザー名",
      firstname: "名",
      lastname: "姓",
      email: "メール",
      "phone-number": "電話番号",
      status: "ステータス",
      role: "役割。",
      operation: "操作。",
      "user-edit": "ユーザーを編集",
      "employee-code": "従業員コード",
      inactive: "非アクティブ",
      active: "アクティブ",
      update: "アップデート",
      "user-info": "ユーザー情報",
      password: "パスワード",
      "add-new": "新規追加",
      edit: "修理",
    },
  },
  vi: {
    translation: {
      homePage: "Trang chủ",
      "materials-management": "Quản lý vật tư",
      "list-materials": "Danh sách vật tư",
      "user-management": "Quản lý người dùng",
      statiscis: "Thống kê",
      "qr-code-manager": "Bàn giao thiết bị",
      "add-new-user": "Thêm người dùng",
      "category-management": "Quản lý danh mục",
      "equip-handover": "Bàn giao thiết bị",
      "list-users": "Danh sách tài khoản người dùng",
      "add-user": "Thêm người dùng",
      delete: "Xóa",
      "confirm-delete": "Xác nhận xóa?",
      confirm: "Xác nhận",
      cancel: "Hủy bỏ",
      "delete-success": "Xóa thành công!",
      "delete-failed": "Xóa thất bại!",
      username: "Tên đăng nhập",
      firstname: "Tên",
      lastname: "Họ",
      email: "Email",
      "phone-number": "Số điện thoại",
      status: "Trạng thái",
      role: "Vai trò",
      operation: "Thao tác",
      "user-edit": "Sửa người dùng",
      "employee-code": "Mã nhân viên",
      inactive: "Không hoạt động",
      active: "Đang hoạt động",
      update: "Cập nhật",
      "user-info": "Thông tin người dùng",
      password: "Mật khẩu",
      "add-new": "Thêm mới",
      edit: "Sửa",
    },
  },
};
const userLanguage = localStorage.getItem("userLanguage") || "vi";
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
