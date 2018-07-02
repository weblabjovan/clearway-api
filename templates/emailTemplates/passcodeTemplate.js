module.exports = (user) => {
	
	return `
		<html>
			<body>
				<div style="text-align: center">
					<h2>${user.username} you requested password code change</h2>
					<p>Use information bellow to finish changing your password.</p>
					<h2>Password change code: ${user.passcode}</h2>
				</div>
			</body>
		</html>

	`;
}