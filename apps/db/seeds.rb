# デフォルトスタッフユーザー
User.find_or_create_by!(email: "staff@example.com") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
  user.name = "スタッフ"
  user.role = "staff"
end

puts "Default staff user created: staff@example.com / password123"
