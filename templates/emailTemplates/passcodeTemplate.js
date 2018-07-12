module.exports = (user) => {
	
	return `
		<html>
			<body>
				<div style="text-align: center">
					<h2>${user.username} je zatražio sigurnosni kod za promenu lzinke</h2>
					<p>Iskoristite ovaj sigurnosni kod da promenite vašu lozinku.</p>
					<h2>Sigurnosni kod: ${user.passcode}</h2>
				</div>
			</body>
		</html>

	`;
}