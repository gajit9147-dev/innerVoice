import { jest } from '@jest/globals';
const query = jest.fn();
jest.unstable_mockModule('../config/db.js', () => ({ default: { query } }));
jest.unstable_mockModule('../services/noteAIService.js', () => ({ analyzeNoteById: jest.fn() }));
const {setNotePassword, verifyNotePassword, deleteNotePassword} = await import('../controllers/noteController.js');
const bcrypt = (await import('bcryptjs')).default;
const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });
beforeEach(() => query.mockReset());
test('sets a custom note password without undefined debug logging', async () => {
  query.mockResolvedValue([{affectedRows:1}]);
  const res=response(); await setNotePassword({params:{id:9},user:{id:3},body:{password:'test-note-password'}},res);
  expect(res.json).toHaveBeenCalledWith({success:true,message:'Password added successfully.'});
  expect(query.mock.calls[0][1][1]).not.toEqual('test-note-password');
});
test('verifies a password without permanently unlocking the note', async () => {
  query.mockResolvedValue([[{security_type:'custom_password',note_password:await bcrypt.hash('test-note-password',4)}]]);
  const res=response();await verifyNotePassword({params:{id:9},user:{id:3},body:{password:'test-note-password'}},res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({success:true}));expect(query).toHaveBeenCalledTimes(1);
});
test('rejects wrong password', async () => {
  query.mockResolvedValue([[{security_type:'custom_password',note_password:await bcrypt.hash('test-note-password',4)}]]);
  const res=response();await verifyNotePassword({params:{id:9},user:{id:3},body:{password:'wrong'}},res);
  expect(res.status).toHaveBeenCalledWith(401);
});
test('removes password after verifying it', async () => {
  query.mockResolvedValueOnce([[{security_type:'custom_password',note_password:await bcrypt.hash('test-note-password',4)}]]).mockResolvedValueOnce([{affectedRows:1}]);
  const res=response();await deleteNotePassword({params:{id:9},user:{id:3},body:{password:'test-note-password'}},res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({success:true}));expect(query).toHaveBeenCalledTimes(2);
});
