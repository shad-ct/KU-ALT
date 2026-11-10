export const up = async (queryInterface) => {
  const now = new Date();

  // 1. Certificate Templates
  await queryInterface.bulkInsert('certificate_templates', [
    {
      id: 1,
      type_code: 'PHD_REG_CERT',
      name: 'Ph.D. Registration Certificate',
      html_body: `
        <div style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 48px; border: 3px double #1e293b; background: #fff;">
          <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 28px;">
            <h1 style="margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; color: #0f172a;">Kannur University</h1>
            <h3 style="margin: 6px 0 0 0; font-size: 15px; font-weight: normal; color: #475569; letter-spacing: 1px;">Research & Development Cell</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Thavakkara, Civil Station P.O., Kannur, Kerala - 670002</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #334155; margin-bottom: 24px;">
            <span>Certificate No: <strong>{{certificate_no}}</strong></span>
            <span>Date of Issue: <strong>{{issue_date}}</strong></span>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <h2 style="font-size: 20px; text-decoration: underline; text-underline-offset: 4px; margin: 0; color: #0f172a;">CERTIFICATE OF PH.D. REGISTRATION</h2>
          </div>

          <div style="font-size: 15px; line-height: 1.8; color: #1e293b; text-align: justify; margin-bottom: 40px;">
            <p>
              This is to certify that <strong>{{scholar_name}}</strong> has been provisionally registered for the degree of <strong>Doctor of Philosophy (Ph.D.)</strong> in the Department of <strong>{{department}}</strong>, Kannur University, with Registration Number <strong>{{registration_no}}</strong>.
            </p>
            <p>
              The research work shall be carried out at <strong>{{centre}}</strong> under the supervision and guidance of <strong>{{guide_name}}</strong>.
            </p>
            <p>
              Approved Research Title / Topic:<br/>
              <strong style="font-style: italic;">"{{research_title}}"</strong>
            </p>
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between; text-align: center; font-size: 13px;">
            <div>
              <div style="height: 40px;"></div>
              <p style="margin: 0; border-top: 1px solid #000; padding-top: 4px; width: 180px;">Research Guide</p>
            </div>
            <div>
              <div style="height: 40px;"></div>
              <p style="margin: 0; border-top: 1px solid #000; padding-top: 4px; width: 180px;">DRC Convenor</p>
            </div>
            <div>
              <div style="height: 40px;"></div>
              <p style="margin: 0; border-top: 1px solid #000; padding-top: 4px; width: 180px;">Director, R&D Cell</p>
            </div>
          </div>
        </div>
      `,
      placeholders: JSON.stringify(['certificate_no', 'issue_date', 'scholar_name', 'registration_no', 'department', 'centre', 'guide_name', 'research_title']),
      is_active: true,
      version: 1,
      created_at: now,
      updated_at: now,
    },
  ]);

  // 2. Equipment Categories
  await queryInterface.bulkInsert('equipment_categories', [
    { id: 1, department_id: 1, name: 'Spectroscopy & Chromatography', is_active: true, created_at: now, updated_at: now },
    { id: 2, department_id: 2, name: 'Laser & Optical Systems', is_active: true, created_at: now, updated_at: now },
    { id: 3, department_id: 3, name: 'Archival & Imaging', is_active: true, created_at: now, updated_at: now },
  ]);

  // 3. Equipment
  await queryInterface.bulkInsert('equipment', [
    {
      id: 1,
      department_id: 1,
      category_id: 1,
      name: 'High-Speed Refrigerated Centrifuge',
      code: 'EQ-CHEM-01',
      description: 'Floor model centrifuge with temperature control from -10°C to +40°C, max 20,000 RPM.',
      usage_instructions: 'Pre-cool rotor before spinning volatile samples. Maximum continuous runtime: 4 hours.',
      specifications: JSON.stringify({ maxSpeed: '20,000 RPM', capacity: '6x250mL', rotorType: 'Fixed Angle' }),
      tracking_mode: 'SERIALIZED',
      total_quantity: 2,
      available_quantity: 2,
      max_loan_days: 7,
      requires_training: true,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      department_id: 1,
      category_id: 1,
      name: 'Analytical Grade Reagents Kit',
      code: 'EQ-CHEM-BULK',
      description: 'Standard reagent pack for organic synthesis assays.',
      usage_instructions: 'Handle under fume hood.',
      specifications: JSON.stringify({ purity: '99.8%', storage: '4°C' }),
      tracking_mode: 'BULK',
      total_quantity: 50,
      available_quantity: 50,
      max_loan_days: 30,
      requires_training: false,
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ]);

  // 4. Equipment Units
  await queryInterface.bulkInsert('equipment_units', [
    {
      id: 1,
      equipment_id: 1,
      asset_tag: 'KU-EQ-CHEM-01-A',
      serial_no: 'SN-CF-2026-001',
      status: 'AVAILABLE',
      condition: 'NEW',
      purchase_date: '2026-01-15',
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      equipment_id: 1,
      asset_tag: 'KU-EQ-CHEM-01-B',
      serial_no: 'SN-CF-2026-002',
      status: 'AVAILABLE',
      condition: 'GOOD',
      purchase_date: '2026-01-15',
      created_at: now,
      updated_at: now,
    },
  ]);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('equipment_units', null, {});
  await queryInterface.bulkDelete('equipment', null, {});
  await queryInterface.bulkDelete('equipment_categories', null, {});
  await queryInterface.bulkDelete('certificate_templates', null, {});
};

