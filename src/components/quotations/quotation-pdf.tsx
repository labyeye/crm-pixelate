
import type { Quotation } from '@/lib/data';

export function QuotationPDF({ quote }: { quote: Quotation }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#000', width: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid black', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0' }}>QUOTATION</h1>
          <p style={{ fontSize: '18px', margin: '5px 0 0 0' }}>Pixelate Nest</p>
          <p style={{ fontSize: '14px', margin: '5px 0 0 0' }}>123 Creative Lane, Suite 101<br/>Tech City, 54321</p>
        </div>
        <div>
          <p style={{ margin: '0', textAlign: 'right' }}><strong>Quotation ID:</strong> {quote.id}</p>
          <p style={{ margin: '5px 0 0 0', textAlign: 'right' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>BILLED TO</h2>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{quote.client}</p>
      </div>

      <div style={{ marginTop: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left', fontSize: '14px' }}>SERVICE</th>
              <th style={{ border: '1px solid black', padding: '10px', textAlign: 'left', fontSize: '14px' }}>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {quote.services.map((service, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '10px', fontSize: '16px' }}>{service}</td>
                <td style={{ border: '1px solid black', padding: '10px', fontSize: '16px' }}>Custom scope for {service}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', paddingBottom: '10px' }}>
            <span>SUBTOTAL</span>
            <span>₹{quote.amount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', borderTop: '2px solid black', paddingTop: '10px', fontWeight: 'bold' }}>
            <span>TOTAL</span>
            <span>₹{quote.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '60px', fontSize: '12px', color: '#666' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Terms & Conditions</h3>
        <p>Payment due within 30 days. This quotation is valid for 15 days from the date of issue. All work is subject to our standard terms of service.</p>
      </div>
    </div>
  );
}
