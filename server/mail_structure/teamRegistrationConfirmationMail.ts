import type { Transporter } from 'nodemailer'
import type { RegistrationRequest } from '~/server/api/registration/index.post'

export async function teamRegistrationConfirmationMail(mailer: Transporter, to: string, data: RegistrationRequest) {
  const { teamName, captain, participants, robots } = data

  const htmlContent = `
    <div style="font-family: sans-serif;">
      <h2>Potwierdzenie rejestracji drużyny</h2>
      <p>Dziękujemy za zgłoszenie drużyny <strong>${teamName}</strong>.</p>
      <p>Otrzymaliśmy poniższe informacje:</p>
      <h2>Dane team leadera</h2>
      <ul>
        <li><strong>Imię:</strong> ${captain.name}</li>
        <li><strong>Nazwisko:</strong> ${captain.surname}</li>
        <li><strong>Rozmiar koszulki:</strong> ${captain.shirtSize}</li>
        <li><strong>Email:</strong> ${captain.email}</li>
        <li><strong>Numer telefonu:</strong> ${captain.phone}</li>
        <li><strong>Adres zamieszkania:</strong> ${captain.street}</li>
        <li><strong>Kod pocztowy:</strong> ${captain.postalCode}</li>
        <li><strong>Miasto:</strong> ${captain.city}</li>
        <li><strong>Kraj:</strong> ${captain.country}</li>
      </ul>
      <h2>Członkowie zespołu</h2>
      <ul>
        ${participants.map((member) => `<li>${member.name} ${member.surname}, Koszulka: ${member.shirtSize}</li>`).join('')}
      </ul>
      <h2>Zgłoszone roboty</h2>
      <ul>
        ${robots.map((robot) => `<li>${robot.name} ,Kategoria : ${robot.category}</li>`).join('')}
      </ul>
      <p>Wkrótce otrzymasz kolejne informacje organizacyjne na ten adres e-mail.</p>
      <br/>
      <p>Pozdrawiamy,<br>Zespół Organizacyjny</p>
    </div>
  `

  try {
    await mailer.sendMail({
      from: `"Robocomp" <${process.env.MAIL_FROM || ''}>`,
      to,
      subject: `Potwierdzenie rejestracji drużyny – ${teamName}`,
      html: htmlContent
    })
  } catch (err) {
    console.error(`Błąd przy wysyłaniu maila do ${to}:`, err)
    throw err
  }
}
